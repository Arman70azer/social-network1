import Image from "next/image";
//pour lancez mon front end il faut faire npm run dev

export default function Page() {
  return (
    <>
      <div>
        <Image src="/assets/google.jpgg" width={50} height={50} alt="Google" />
        <div className="form-wrapper">
          <div className="form-side">
            
            <form className="my-form">
              <div className="form-welcome-row">
                <h1>Fais ton Compte &#x1F44F;</h1>
              </div>
              <div className="socials-row">
                <a href="#" title="Use Google">
                  <Image src="/assets/google.jpg" width={24} height={24} alt="Google" />
                  Goggle
                </a>
                <a href="#" title="Use Apple">
                  <Image src="/assets/apple.png" width={24} height={24} alt="Apple" />
                   Apple
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
            <Image src="/assets/mock.png" width={300} height={200} alt="Mock" className="mockup" />
          </div>
        </div>
      </div>
      <script src="script.js"></script>
    </>
  );
}
