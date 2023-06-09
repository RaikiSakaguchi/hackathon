FROM golang:1.18 as build
WORKDIR /cd
COPY ./go/main.go ./go/go.mod ./go/go.sum /cd/
CMD ["go", "run", "main.go"]
EXPOSE 8080