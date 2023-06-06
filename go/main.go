package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/oklog/ulid/v2"
	"log"
	"math/rand"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

type MsgDataForHTTPGet struct {
	Id       string `json:"id"`
	EditorID string `json:"editorID"`
	Date     string `json:"date"`
	IsEdit   bool   `json:"isEdit"`
	Content  int    `json:"content"`
}
type MsgDataForHTTPPost struct {
	Id       string `json:"id"`
	EditorID string `json:"editorID"`
	Date     string `json:"date"`
	IsEdit   bool   `json:"isEdit"`
	Content  int    `json:"content"`
}

// ① GoプログラムからMySQLへ接続
var db *sql.DB

func init() {
	mysqlUser := os.Getenv("MYSQL_USER")
	mysqlPwd := os.Getenv("MYSQL_PWD")
	mysqlHost := os.Getenv("MYSQL_HOST")
	mysqlDatabase := os.Getenv("MYSQL_DATABASE")

	connStr := fmt.Sprintf("%s:%s@%s/%s", mysqlUser, mysqlPwd, mysqlHost, mysqlDatabase)
	_db, err := sql.Open("mysql", connStr)
	if err != nil {
		log.Fatalf("fail: sql.Open, %v\n", err)
	}
	if err := _db.Ping(); err != nil {
		log.Fatalf("fail: _db.Ping, %v\n", err)
	}
	db = _db
}

func handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Headers", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Content-Type", "application/json")
	switch r.Method {
	case http.MethodOptions:
		w.WriteHeader(http.StatusOK)
		return
	case http.MethodGet:
		//メッセージデータを取得する
		rows, err := db.Query("SELECT id, name, age FROM user")
		if err != nil {
			log.Printf("fail: db.Query, %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		users := make([]MsgDataForHTTPGet, 0)
		for rows.Next() {
			var u MsgDataForHTTPGet
			if err := rows.Scan(&u.Id, &u.EditorID, &u.Date, &u.Content); err != nil {
				log.Printf("fail: rows.Scan, %v\n", err)
				if err := rows.Close(); err != nil {
					// 500を返して終了するが、その前にrowsのClose処理が必要
					log.Printf("fail: rows.Close(), %v\n", err)
				}
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			users = append(users, u)
		}

		bytes, err := json.Marshal(users)
		if err != nil {
			log.Printf("fail: json.Marshal, %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(bytes)
	case http.MethodPost:
		//メッセージを送る
		decoder := json.NewDecoder(r.Body)
		var newMsg MsgDataForHTTPPost
		if err := decoder.Decode(&newMsg); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		//if newUser.Name == "" || len(newUser.Name) > 50 {
		//	w.WriteHeader(http.StatusBadRequest)
		//	return
		//}
		//if newUser.Age > 80 || newUser.Age < 20 {
		//	w.WriteHeader(http.StatusInternalServerError)
		//	return
		//}
		entropy := rand.New(rand.NewSource(time.Now().UnixNano()))
		ms := ulid.Timestamp(time.Now())
		_msgId, _ := ulid.New(ms, entropy)
		msgId := _msgId.String()
		tx, err := db.Begin()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		_, err = tx.Exec("insert into user values (?, ?, ?, ?, ?);", msgId, newMsg.EditorID, newMsg.Date, newMsg.Content, newMsg.IsEdit)
		if err != nil {
			tx.Rollback()
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Printf(err.Error())
			fmt.Print(newMsg)
			return
		}
		if err := tx.Commit(); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	default:
		log.Printf("fail: HTTP Method is %s\n", r.Method)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
}

func main() {
	// ② /userでリクエストされたらnameパラメーターと一致する名前を持つレコードをJSON形式で返す
	http.HandleFunc("/message", handler)
	http.HandleFunc("/messages", handler)

	// ③ Ctrl+CでHTTPサーバー停止時にDBをクローズする
	closeDBWithSysCall()

	log.Println("Listening...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

// ③ Ctrl+CでHTTPサーバー停止時にDBをクローズする
func closeDBWithSysCall() {
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		s := <-sig
		log.Printf("received syscall, %v", s)

		if err := db.Close(); err != nil {
			log.Fatal(err)
		}
		log.Printf("success: db.Close()")
		os.Exit(0)
	}()
}
