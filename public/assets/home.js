const socket = io('http://localhost:5000');

// const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");

let userName = "";

const newUserConnected = () => {
    userName = readCookie("username");
    //call server by my new name
    socket.emit("IamNewUSER", userName);
    document.getElementById('myName').innerHTML = userName;
};

const addToUsersBox = (userName) => {
    if (!!document.querySelector(`.${userName}-userlist`)) {
        return;
    }

    const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <h5>${userName}</h5>
    </div>
  `;
    //   alert(userName)
    //   alert(parseInt(mainCount.innerHTML))
    // inboxPeople.innerHTML += userBox;
    // mainCount.innerHTML = parseInt(mainCount.innerHTML) + 1;
};
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// new user is created so we generate nickname and emit event /////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
newUserConnected();

socket.on("newUserForALL", function (data) {
    data.map((user) => addToUsersBox(user));
    // alert(data.length)
    mainCount.innerHTML = data.length
});

socket.on("user disconnected", function (userName) {
    document.querySelector(`.${userName}-userlist`).remove();
});

const addNewMessage = ({ user, message }) => {
    const time = new Date();
    const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

    const receivedMsg = `
    <div class="messageHer">
    <img src="https://w7.pngwing.com/pngs/926/34/png-transparent-computer-icons-user-profile-avatar-avatar-face-heroes-silhouette.png"
        alt="" />
        <span><b>${user}:<b style="color: blueviolet;">${formattedTime}</b><br></b> ${message}</span>
    <div class="clearFix"></div>
</div>`;

    const myMsg = `
  <div class="messageMe">
  <img src="https://icons-for-free.com/iconfiles/png/512/avatar+human+male+man+men+people+person+profile+user+users-1320196163635839021.png"
      alt="" />
    <span><b>${user}:<b style="color: blueviolet;">${formattedTime}</b><br></b> ${message}</span>
  <div class="clearFix"></div>
</div>`;

    messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!inputField.value) {
        return;
    }

    socket.emit("chat message", {
        message: inputField.value,
        nick: userName,
    });

    inputField.value = "";
});

inputField.addEventListener("keyup", () => {
    socket.emit("typing", {
        isTyping: inputField.value.length > 0,
        nick: userName,
    });
});

socket.on("chat message", function (data) {
    addNewMessage({ user: data.nick, message: data.message });
});

socket.on("typing", function (data) {
    const { isTyping, nick } = data;

    if (!isTyping) {
        fallback.innerHTML = "";
        return;
    }

    fallback.innerHTML = `<p>${nick} is typing...</p>`;
});

$(function () {
    $(".panel.panel-chat > .panel-heading > .chatMinimize").click(function () {
        if ($(this).parent().parent().hasClass('mini')) {
            $(this).parent().parent().removeClass('mini').addClass('normal');

            $('.panel.panel-chat > .panel-body').animate({ height: "250px" }, 500).show();

            $('.panel.panel-chat > .panel-footer').animate({ height: "75px" }, 500).show();
        }
        else {
            $(this).parent().parent().removeClass('normal').addClass('mini');

            $('.panel.panel-chat > .panel-body').animate({ height: "0" }, 500);

            $('.panel.panel-chat > .panel-footer').animate({ height: "0" }, 500);

            setTimeout(function () {
                $('.panel.panel-chat > .panel-body').hide();
                $('.panel.panel-chat > .panel-footer').hide();
            }, 500);


        }

    });
    $(".panel.panel-chat > .panel-heading > .chatClose").click(function () {
        $(this).parent().parent().remove();
    });
})

function createCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function readCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var user = getCookie("username");
    if (user != "") {
        alert("Welcome again " + user);
    } else {
        user = prompt("Please enter your name:", "");
        if (user != "" && user != null) {
            setCookie("username", user, 365);
        }
    }
}