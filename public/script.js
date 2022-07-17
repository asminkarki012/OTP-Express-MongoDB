const emailCheck = document.getElementById('emailSubmit');
registerForm.addEventListener('submit', event => {
    event.preventDefault();
    console.log("email check")
})



const registerForm = document.getElementById('formSignup');
registerForm.addEventListener('submit', event => {
    event.preventDefault();
    const userData = {
        fullname: event.target[0].value,
        adress: event.target[1].value,
        email: event.target[2].value,
        contact_no: event.target[3].value,
        dob: event.target[4].value,
    }
    console.log(userData)
    fetch("/users/signup", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    }).then((response) => {
        response.json().then((res) => {
            console.log(res)
            if (res.msg === 'ok') {
                console.log('redirecting....')
                window.location.href = `/enterotp/${res.email}`;
            }
        })
        
    }).catch((err) => {
        console.log(err)
    })
});