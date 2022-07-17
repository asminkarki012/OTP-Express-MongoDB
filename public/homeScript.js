console.log("js file loaded from homeScript")

const emailCheck = document.getElementById('emailSubmit');
emailCheck.addEventListener('submit', event => {
    event.preventDefault();
    console.log("email check");

    const email = event.target[0].value
    console.log(email)
    fetch(`/emailCheck?email=${email}`, {
        method: 'GET'
    }).then((response) => {
        response.json().then((res) => {
            console.log(res)
            if (res.msg === 'redirect') {
                console.log('redirecting....')
                window.location.href = `${res.to}`;
            }
            if (res.msg === 'wrongOPT') {
                console.log("worng opt entered")
            }
        })

    }).catch((err) => {
        console.log(err)
    })
})