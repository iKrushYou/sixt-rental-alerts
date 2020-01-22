const axios = require('axios')
const moment = require('moment')

const args = require('minimist')(process.argv.slice(2));

const API_URL = 'https://web-api.orange.sixt.com'

const getRentals = async () => {
    const method = 'GET';
    const url = `${API_URL}/v1/rentaloffers/offers?${new URLSearchParams({
        pickupStation: 43997,
        returnStation: 43997,
        pickupDate: '2020-03-19T18:00:00',
        returnDate: '2020-03-24T15:00:00',
        carType: 'car',
        currency: 'USD',
    })}`;

    const response = await axios({method, url})

    return response.data
}

const slackKey = args['slack-key']

const slackWebhook = `https://hooks.slack.com/services/TLSPDFQE8/BSYAG0MC0/${slackKey}`;

const sendSlackMessage = async message => {
    const method = 'POST';
    try {
        const response = await axios({method, url: slackWebhook, data: {text: message}})
    } catch (e) {
        console.log({e})
    }
}

const main = async () => {

    const data = await getRentals();

    const cars = data.offers.filter(rental => rental.vehicleGroupInfo.bodyStyle === 'SUV' && rental.carGroupInfo.maxPassengers === 7)
        .sort((a, b) => b.prices.totalPrice.amount.value - a.prices.totalPrice.amount.value)

    let messages = [moment().format('LLL')]

    cars.forEach(car => {
        const carName = car.description;
        const costTotal = `${car.prices.totalPrice.amount.value} ${car.prices.totalPrice.amount.currency}`
        const costDay = `${car.prices.dayPrice.amount.value} ${car.prices.dayPrice.amount.currency}`

        const message = `${carName}: ${costDay} / day (${costTotal} total)`;
        console.log(message);
        messages.push(message)
    })

    await sendSlackMessage(messages.join('\n'))

}

main()