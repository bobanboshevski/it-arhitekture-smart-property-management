package rabbitmq

import (
	"encoding/json"
	"log"
	"os"

	"github.com/streadway/amqp"
)

type Publisher struct {
	conn    *amqp.Connection
	channel *amqp.Channel
	queue   string
}

func NewPublisher() *Publisher {
	url := os.Getenv("RABBITMQ_URL")

	queue := os.Getenv("RABBITMQ_QUEUE")

	conn, err := amqp.Dial(url)
	if err != nil {
		log.Fatalf("failed to connect to rabbitMQ: %v", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("failed to open channel: %v", err)
	}

	_, err = ch.QueueDeclare(
		queue,
		true,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		log.Fatalf("failed to declare queue: %v", err)
	}

	return &Publisher{
		conn:    conn,
		channel: ch,
		queue:   queue,
	}

}

func (p *Publisher) Publish(event interface{}) error {
	body, err := json.Marshal(event) // todo: check what is this
	if err != nil {
		return err
	}

	return p.channel.Publish(
		"", // todo: is it okay to have exchange like this
		p.queue,
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         body,
			DeliveryMode: amqp.Persistent,
		},
	)
}
