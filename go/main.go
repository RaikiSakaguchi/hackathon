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
	Id         string `json:"id"`
	EditorID   string `json:"editorID"`
	EditorName string `json:"editorName"`
	Date       string `json:"date"`
	IsEdit     bool   `json:"isEdit"`
	Content    string `json:"content"`
	Photo      string `json:"photo"`
}
type MsgDataForHTTPPost struct {
	EditorID string `json:"editorID"`
	Date     string `json:"date"`
	IsEdit   bool   `json:"isEdit"`
	Content  string `json:"content"`
}
type MsgDataForEdit struct {
	Id      string `json:"id"`
	Content string `json:"content"`
}
type Content struct {
	Text string
}
type UserInfo struct {
	Id    string `json:"id"`
	Name  string `json:"name"`
	Photo string `json:"photo"`
}

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
func include(slice []string, target string) bool {
	for _, num := range slice {
		if num == target {
			return true
		}
	}
	return false
}
func handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Content-Type", "application/json")
	switch r.Method {
	case http.MethodOptions:
		w.WriteHeader(http.StatusOK)
		return
	case http.MethodGet:
		//全メッセージを取得する
		rows, err := db.Query(
			"SELECT messages.id, editor_id, editor_name, created_at, content, is_edit, photo FROM messages join users on messages.editor_id = users.id;")
		if err != nil {
			log.Printf("fail: db.Query, %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		msgs := make([]MsgDataForHTTPGet, 0)
		for rows.Next() {
			var u MsgDataForHTTPGet
			if err := rows.Scan(&u.Id, &u.EditorID, &u.EditorName, &u.Date, &u.Content, &u.IsEdit, &u.Photo); err != nil {
				log.Printf("fail: rows.Scan, %v\n", err)
				if err := rows.Close(); err != nil {
					log.Printf("fail: rows.Close(), %v\n", err)
				}
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			msgs = append(msgs, u)
		}
		//msgsの内容をjsonに変換する
		bytes, err := json.Marshal(msgs)
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
			w.WriteHeader(http.StatusBadRequest)
			fmt.Errorf(err.Error())
			return
		}
		if newMsg.Content == "" {
			return
		}
		entropy := rand.New(rand.NewSource(time.Now().UnixNano()))
		ms := ulid.Timestamp(time.Now())
		_msgId, _ := ulid.New(ms, entropy)
		msgId := _msgId.String()
		tx, err := db.Begin()
		if err != nil {
			fmt.Errorf(err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		_, err = tx.Exec("insert into messages values (?, ?, ?, ?, ?);", msgId, newMsg.EditorID, newMsg.Date, newMsg.Content, newMsg.IsEdit)
		if err != nil {
			tx.Rollback()
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Printf(err.Error())
			fmt.Print(newMsg)
			return
		}
		if err := tx.Commit(); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Errorf(err.Error())
			return
		}
		w.WriteHeader(http.StatusOK)
	default:
		log.Printf("fail: HTTP Method is %s\n", r.Method)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
}
func editHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Content-Type", "application/json")
	switch r.Method {
	case http.MethodOptions:
		w.WriteHeader(http.StatusOK)
		return
	case http.MethodPost:
		//編集したメッセージを格納する
		decoder := json.NewDecoder(r.Body)
		var editMsg MsgDataForEdit
		if err := decoder.Decode(&editMsg); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Errorf(err.Error())
			return
		}
		rows, err := db.Query("SELECT content FROM messages WHERE id=?", editMsg.Id)
		if err != nil {
			log.Printf("fail: db.Query, %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		var contents Content
		for rows.Next() {
			var c Content
			if err := rows.Scan(&c.Text); err != nil {
				log.Printf("fail: rows.Scan, %v\n", err)
				if err := rows.Close(); err != nil {
					log.Printf("fail: rows.Close(), %v\n", err)
				}
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			contents = c
		}

		if contents.Text == editMsg.Content {
			fmt.Printf("same content")
			return
		}
		tx, err := db.Begin()
		if err != nil {
			fmt.Errorf(err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		_, err = tx.Exec("UPDATE messages SET content = ?, is_edit = true WHERE id = ?;", editMsg.Content, editMsg.Id)
		fmt.Printf("successfully updated content")
		if err != nil {
			tx.Rollback()
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Printf(err.Error())
			fmt.Print(editMsg)
			return
		}
		if err := tx.Commit(); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Errorf(err.Error())
			return
		}
		w.WriteHeader(http.StatusOK)
	default:
		log.Printf("fail: HTTP Method is %s\n", r.Method)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
}
func userHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Content-Type", "application/json")
	switch r.Method {
	case http.MethodOptions:
		w.WriteHeader(http.StatusOK)
		return
	case http.MethodGet:
		//指定されたユーザー情報を取得する
		decoder := json.NewDecoder(r.Body)
		var newUser UserInfo
		if err := decoder.Decode(&newUser); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Errorf(err.Error())
			return
		}
		rows, err := db.Query("SELECT * FROM users WHERE id = ?", newUser.Id)
		if err != nil {
			log.Printf("fail: db.Query, %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		var u UserInfo
		if err := rows.Scan(&u.Id, &u.Name, &u.Photo); err != nil {
			log.Printf("fail: rows.Scan, %v\n", err)
			if err := rows.Close(); err != nil {
				log.Printf("fail: rows.Close(), %v\n", err)
			}
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		//msgsの内容をjsonに変換する
		bytes, err := json.Marshal(u)
		if err != nil {
			log.Printf("fail: json.Marshal, %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(bytes)
	case http.MethodPost:
		fmt.Printf("呼び出されたよ")
		//ユーザー情報を登録する
		rows, err := db.Query("SELECT id FROM users")
		if err != nil {
			log.Printf("fail: db.Query, %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		ids := make([]string, 0)
		for rows.Next() {
			var u UserInfo
			if err := rows.Scan(&u.Id); err != nil {
				log.Printf("fail: rows.Scan, %v\n", err)
				if err := rows.Close(); err != nil {
					log.Printf("fail: rows.Close(), %v\n", err)
				}
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			ids = append(ids, u.Id)
		}
		fmt.Printf("初めの1っぽ")
		decoder := json.NewDecoder(r.Body)
		var newUser UserInfo
		if err := decoder.Decode(&newUser); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Errorf(err.Error())
			return
		}
		fmt.Printf("読み込めた")
		if include(ids, newUser.Id) {
			fmt.Printf("same user")
			return
		}
		tx, err := db.Begin()
		if err != nil {
			fmt.Errorf(err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		fmt.Printf("ユーザー登録 %s %s %s", newUser.Id, newUser.Name, newUser.Photo)
		_, err = tx.Exec("insert into users values (?, ?, ?);", newUser.Id, newUser.Name, newUser.Photo)
		if err != nil {
			tx.Rollback()
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Printf(err.Error())
			return
		}
		if err := tx.Commit(); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Errorf(err.Error())
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
	http.HandleFunc("/message", handler)
	http.HandleFunc("/edit", editHandler)
	http.HandleFunc("/user", userHandler)
	closeDBWithSysCall()
	log.Println("Listening...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

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
