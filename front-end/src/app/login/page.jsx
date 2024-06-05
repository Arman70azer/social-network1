import "../connexion.css"; 
import "../style.css"; 
import test from '../ui/img/toufik.png'; 
import t from '../ui/img/armand.jpg'; 
import tt from '../ui/img/alex.jpg'; 
import ttt from '../ui/img/brad.jpg'; 
import tttt from '../ui/img/cypri.jpg'; 
import googleLogo from '../ui/img/google.jpg';
import githubLogo from '../ui/img/github.jpg';

export default function Page() {
  const profiles = [
    { name: "Toufik Himoum", role: "Développeur Full stack", company: "Google", skills: ["React.js", "Node.js", "CSS", "Game", "Golang", "HTML", "Javascript"], img: test.src, infoLink: "https://www.instagram.com/toufehhh/" },
    { name: "Armand Auvray", role: "Développeur Full stack", company: "Google", skills: ["React.js", "Node.js", "CSS", "Game", "Golang", "HTML", "Javascript"], img: t.src, infoLink: "https://www.instagram.com/arman_auvray/" },
    { name: "Bradley Baptiste", role: "Développeur Full stack", company: "Google", skills: ["React.js", "Node.js", "CSS", "Game", "Golang", "HTML", "Javascript"], img: ttt.src, infoLink: "https://www.twitch.tv/golden_gwada" },
    { name: "Cypriano Escriva", role: "Développeur Full stack", company: "Google", skills: ["React.js", "Node.js", "CSS", "Game", "Golang", "HTML", "Javascript"], img: tttt.src, infoLink: "https://www.police-nationale.interieur.gouv.fr/" },
    { name: "Alex Valin", role: "Développeur Full stack", company: "Google", skills: ["React.js", "Node.js", "CSS", "Game", "Golang", "HTML", "Javascript"], img: tt.src, infoLink: "https://500px.com/p/alexandre-valin?view=photos" },
  ];

  return (
    <div className="form-wrapper">
      <div className="form-side">
        <form className="my-form">
          <div className="form-welcome-row">
            <h1>Fais ton Compte &#x1F44F;</h1>
          </div>
          <div className="socials-row">
            <a href="https://www.google.com/intl/fr/gmail/about/" title="Use Google">
              <img src={googleLogo.src} width={24} height={24} alt="Google" />
              Google
            </a>
            <a href="https://github.com/dashboard" title="Use Github">
              <img src={githubLogo.src} width={24} height={24} alt="GitHub" />
              Github
            </a>
          </div>
          <div className="divider">
            <div className="divider-line"></div> Or <div className="divider-line"></div>
          </div>
          <div className="text-field">
            <label htmlFor="email">Email:
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="off"
                placeholder="Ton Email"
                required
              />
            </label>
          </div>
          <div className="text-field">
            <label htmlFor="password">Password:
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Ton Password"
                title="Minimum 6 characters with at least 1 Alphabet and 1 Number"
                pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$"
                required
              />
            </label>
          </div>
          <button type="submit" className="my-form__button">Login</button>
          <div className="my-form__actions">
            <a href="#" title="Reset Password">
              Reset Password
            </a>
            <a href="#" title="Create Account">
              Already have an account?
            </a>
          </div>
        </form>
      </div>
      <div className="info-side">
        <div className="profile-cards">
          {profiles.map((profile, index) => (
            <article className="card" key={index}>
              <div className="background">
                {profile.img && <img src={profile.img} alt="profile" />}
              </div>
              <div className="content">
                <h2>{profile.name}</h2>
                <p>
                  {profile.role}
                  <a href="https://google.com" title={profile.company}> {profile.company}</a>
                </p>
                <p>Développeur Web :</p>
                <ul className="chips">
                  {profile.skills.map((skill, idx) => (
                    <li className="chip" key={idx}>{skill}</li>
                  ))}
                </ul>
                <div className="action-buttons">
                  <a href={profile.infoLink}>
                    Information
                  </a>
                  <a href="#learn-more" className="secondary">
                    le bouton pour le style
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
