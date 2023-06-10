import { signInWithPopup, GoogleAuthProvider, signOut, getAuth, User } from "firebase/auth";
import { fireAuth } from "./firebase";
import { useState } from "react";

export const LoginForm: React.FC = () => {
  const [user, setUser] = useState<User|null>(getAuth().currentUser);
  const assignUser = async (u: User) => {
    console.log("ユーザー登録したい")
    try {
      console.log(user);
      const newUser = await fetch(
        "https://hackathon2-5xie62mgea-uc.a.run.app/user",
        {
          method: "POST",
          body: JSON.stringify({
            id : u?.uid,
            name : u?.displayName,
            photo : u?.photoURL
          }),
        }
        );
      if (!newUser.ok) {
        throw Error(`Failed to create user: ${newUser.status}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

// googleでログインする
  const signInWithGoogle = (): void => {
    // Google認証プロバイダを利用する
    const provider = new GoogleAuthProvider();
    // ログイン用のポップアップを表示
    signInWithPopup(fireAuth, provider)
      .then(res => {
        const u = res.user;
        setUser(u);
        console.log(user);
        console.log(u);
        alert("ログインユーザー: " + u.displayName);
        assignUser(u);
      })
      .then(_ => {
        console.log(user);
      })
      .catch(err => {
        const errorMessage = err.message;
        alert(errorMessage);
      });
  };

  /**
   * ログアウトする
   */
  const signOutWithGoogle = (): void => {
    signOut(fireAuth).then(() => {
      alert("ログアウトしました");
    }).catch(err => {
      alert(err);
    });
  };

  return (
    <div>
    {!fireAuth.currentUser ? 
    <div className="login">
      <button className="btn" title="ログイン" onClick={signInWithGoogle}>
        Googleでログイン
      </button>
    </div>
    :
    <div className="logout">
      <button className="btn" title="ログアウト" onClick={signOutWithGoogle}>
        ログアウト
      </button>
    </div>
}
    </div>
  );
};