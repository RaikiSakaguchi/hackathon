FROM golang:1.18 as build
WORKDIR /cd
COPY ./go/. /cd
CMD ["go", "run", "main.go"]
EXPOSE 8080