FROM golang:1.18 as build
WORKDIR /cd
COPY ./main.go /cd
CMD ["go", "run", "main.go"]
EXPOSE 8080