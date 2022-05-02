function verifyInputs() {
    var input_name = document.getElementsById('name');
    var input_email = document.getElementsById('email');

    if (input_name.value == '' || input_email.value == '') {
        return false;
    }
    else{
        alert('Mensaje enviado... presione aceptar para finalizar el envío.');
        return true;
    }

  }