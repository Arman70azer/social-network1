"use client";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'; // Utiliser useRouter de 'next/navigation'
import DashboardTop from "../components/dashboard";
import fetchDataHome from "../lib/fetchDataHome";
import openWebSocketConnexion from "../lib/websocket";
import styles from "../styles/profil.module.css";
import eventUpdate from "../utils/eventUpdate";
import cookieExist from "../utils/cookieUserExist";
import sendAndReceiveData from "../lib/sendForm&ReceiveData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import SettingsProfil from "../components/settingsProfil";
let wssocket;
export default function page() {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [user, setUser] = useState({
        token: "",
        name: "",
    });
    const [nbrSub, setNewFollow] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState({
        ID: 0,
        Nickname: "",
        Email: "",
        Password: "",
        FirstName: "",
        LastName: "",
        Birthday: "",
        Age: 0,
        ImageName: "",
        UrlImage: "",
        AboutMe: "",
    });
    const [settings, setSettings] = useState(false);
    const [postsUser, setPostsUser] = useState([]);
    useEffect(() => {
        const cookieUser = cookieExist();
        const urlParams = new URLSearchParams(window.location.search);
        const userParam = urlParams.get("user");
        const fetchData = async () => {
            const datafetch = await fetchDataHome();
            setData(datafetch);
            const userProfil = datafetch.Users.filter((client) => client.Nickname === userParam)[0];
            setUserInfo(userProfil);
            const form = new FormData();
            form.append("token", cookieUser);
            const userInfo1 = await sendAndReceiveData("/api/profil", form);
            setUser({
                name: userInfo1.Users[0].Nickname,
                token: cookieUser,
            });
            console.log(user);
            if (datafetch.Posts) {
                setPostsUser(datafetch.Posts.filter((post) => post.Author.Nickname === userParam));
            }
            await fetchFollow(userProfil, userInfo1.Users[0].Nickname);
        };
        const fetchFollow = async (userProfil, userName) => {
            const formData = new FormData();
            formData.append("token", cookieUser);
            formData.append("userProfil", userProfil.Nickname);
            const dataReceved = await sendAndReceiveData("/api/follow", formData);
            if (dataReceved.userProfil.PeopleWhoFollowMe) {
                setNewFollow(dataReceved.userProfil.PeopleWhoFollowMe.length);
                if (dataReceved.userProfil.PeopleWhoFollowMe.some((userSub) => userSub.Nickname === userName)) {
                    setIsFollowing(true);
                }
            }
        };
        fetchData();
        wssocket = openWebSocketConnexion(userParam);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, [router.asPath]); // Ajout de la dépendance à router.asPath
    const onMessageWS = () => {
        if (data && wssocket != null) {
            wssocket.onmessage = (event) => {
                const receivedMessage = JSON.parse(event.data);
                if (receivedMessage.Accept && receivedMessage.Event) {
                    const eventTarget = eventUpdate(data.Events, receivedMessage);
                    setData((prevData) => {
                        const updateEvents = prevData.Events.map((event) => {
                            if (event.Titre === eventTarget.Titre) {
                                return eventTarget;
                            } else {
                                return event;
                            }
                        });
                        return { ...prevData, Events: updateEvents };
                    });
                    console.log(data.Events[0].Followers);
                }
            };
        }
    };
    const handleSettingsClick = () => {
        setSettings(!settings);
    };
    const handleFollow = async () => {
        const formFollow = new FormData();
        formFollow.append("token", user.token);
        formFollow.append("userProfil", userInfo.Nickname);
        formFollow.append("nature", "follow");
        const response = await sendAndReceiveData("/api/follow", formFollow);
        console.log(response);
        if (response.Accept) {
            if (response.action === "You're now subscribe") {
                setNewFollow(nbrSub + 1);
                setIsFollowing(true);
            } else {
                setNewFollow(nbrSub - 1);
                setIsFollowing(false);
            }
        }
    };
    const setUsertoParam = (key, value) => {
        setUserInfo({
            ...userInfo,
            [key]: value,
        });
        if (key === "Nickname") {
            setUser({
                name: value,
            });
        }
    };
    const handleProfileClick = () => {
        router.push(`?user=${user.name}`);
    };
    onMessageWS();
    return (
        <div>
            {data.Events && wssocket != null ? (
                <DashboardTop events={data.Events} ws={wssocket} setData={setData} />
            ) : (
                <DashboardTop />
            )}
            <div className={styles.background}>
                {userInfo.Nickname !== "" && !isLoading ? (
                    <div className={styles.Content}>
                        {user.name === userInfo.Nickname && (
                            <>
                                <div className={styles.settings}>
                                    <button className={styles.settingsButton} onClick={handleSettingsClick}>
                                        <FontAwesomeIcon icon={faCog} className={styles.settingsIcon} />
                                    </button>
                                </div>
                                {settings && (
                                    <SettingsProfil onClose={handleSettingsClick} user={userInfo} setUser={setUsertoParam} />
                                )}
                            </>
                        )}
                        <div className={styles.publicPart}>
                            <img className={styles.avatar} src={`${userInfo.UrlImage}`} alt="Avatar" />
                            <div className={styles.nickname}>{userInfo.Nickname}</div>
                            {user.name !== userInfo.Nickname && (
                                <button className={styles.followButton} onClick={handleFollow}>
                                    {isFollowing ? "Unsubscribe" : "Subscribe"}
                                </button>
                            )}
                            {(isFollowing || user.name === userInfo.Nickname) && ( // Afficher les informations utilisateur uniquement si l'utilisateur est abonné ou sur son propre profil
                                <>
                                    <div className={styles.statProfil}>
                                        <span>
                                            <i className="fas fa-birthday-cake"></i> Age: {userInfo.Age} years
                                        </span>
                                        <span>
                                            <i className="fas fa-calendar-alt"></i> Birthday: {userInfo.Birthday}
                                        </span>
                                        <span>
                                            <i className="fas fa-followers"></i> Number of followers: {nbrSub}
                                        </span>
                                        <span>
                                            <i className="fas fa-posts"></i> Number of posts: {postsUser && postsUser.length > 0 ? postsUser.length : 0}
                                        </span>
                                    </div>
                                    <div>Bio:</div>
                                    <div className={styles.bio}>
                                        {userInfo.AboutMe ? userInfo.AboutMe : "Give some information about you!!!"}
                                    </div>
                                    <div>Post:</div>
                                    <div>
                                        {postsUser && postsUser.length > 0 ? (
                                            postsUser.map((post, index) => (
                                                <div className={styles.post_details} key={index}>
                                                    <div className={styles.post_date}>
                                                        From {post.Date.split(" ")[0]} to {post.Date.split(" ")[1]}
                                                    </div>
                                                    {post.ImageName && <img src={post.UrlImage} className={styles.post_image}></img>}
                                                    <div className={styles.post_content}>{post.Content}</div>
                                                    <div className={styles.likeDislike}>
                                                        Like: {post.Likes && post.Likes.length > 0 ? post.Likes.length : 0} Dislike: {post.Dislikes && post.Dislikes.length > 0 ? post.Dislikes.length : 0}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className={styles.no_posts}>aucun post</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={styles.overlay}>
                        <div className={styles.loader}></div>
                        <p>Load of profile data...</p>
                    </div>
                )}
            </div>
            <button onClick={handleProfileClick}>Profil</button> {/* Bouton pour accéder au profil de l'utilisateur connecté */}
        </div>
    );
}