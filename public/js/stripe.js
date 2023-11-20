const showAlert = (type, msg) => {
  hideAlert()

  const markup = `<div class="alert alert--${type}">${msg}</div>`
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup)
}

const stripe = Stripe(
  'pk_test_51NuqufJuSqeWEmKDJqKRzJzwTR0O9P9Jre8ZdN1Ypc6QnZZJY2ff8sVv9DgHZKWgLZvVBZNh3ZlzPjoSjomHjPYG00hiS7WeEs'
)

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    )
    console.log(session, "session")

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    })
  } catch (error) {
    console.log(error);
    showAlert('error', error)
  }
}
