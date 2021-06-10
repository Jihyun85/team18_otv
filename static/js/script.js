const reviewForm = document.getElementById('reviewForm');

window.onpageshow = function (event) {
    if (event.persisted || (window.performance && window.performance.navigation.type == 2)) {
        location.reload();
    }
}

function toggle_like(id) {
    const likes = document.querySelectorAll('.likes');
    const likes_array = Array.prototype.slice.call(likes);
    const target_btn = likes_array.find((btn) => Number(btn.dataset.id) === Number(id));
    if (target_btn.classList.contains('like-btn')) {
        target_btn.innerHTML = '<i class="fa fa-heart heart" aria-hidden="true"></i>';
        target_btn.classList.remove('like-btn');
        target_btn.classList.add('dislike-btn');
        $.ajax({
            type: "POST",
            url: "/api/likes",
            data: {'id_give': id, 'action_give': 'like'},
            success: function (res) {
                const counts = document.querySelectorAll('.likes-count');
                const counts_array = Array.prototype.slice.call(counts);
                const target_count = counts_array.find((count) => Number(count.dataset.num) === Number(id));
                target_count.innerHTML = res.count;
            }
        })

    } else {
        target_btn.innerHTML = '<i class="fa fa-heart-o heart" aria-hidden="true"></i>';
        target_btn.classList.add('like-btn');
        target_btn.classList.remove('dislike-btn');
        $.ajax({
            type: "POST",
            url: "/api/likes",
            data: {'id_give': id, 'action_give': 'dislike'},
            success: function (res) {
                const counts = document.querySelectorAll('.likes-count');
                const counts_array = Array.prototype.slice.call(counts);
                const target_count = counts_array.find((count) => Number(count.dataset.num) === Number(id));
                target_count.innerHTML = res.count;
            }
        })
    }
}


function saveReview(e) {
    e.preventDefault();
    const pathnameAry = window.location.pathname.split('/');
    const webtoon_id = pathnameAry[pathnameAry.length - 1];
    const textarea = document.getElementById("textarea-post");
    const review = textarea.value;

    if (!review || review.trim() == false) {
        alert('리뷰를 한 글자 이상 입력해주세요.');
        return;
    }

    textarea.value = "";
    const date = new Date();

    $.ajax({
        type: "POST",
        url: `/api/reviews/${webtoon_id}`,
        data: {
            'text_give': review,
            'date_give': date,
        },
        success: function (res) {
            const reviewsContainer = document.getElementById('reviewsContainer');
            const {nickname, review_id} = res.result;
            console.log(typeof (review_id))
            const div = document.createElement('div');
            div.classList.add("review-container");
            div.setAttribute("id", review_id)
            let html_temp = `
                        <div class="review-card">
                            <span class="review-name"><strong>${nickname}</strong></span>
                            <p class="review-text">${review}</p>
                            <div class="delete-box">                            
                                <button onclick=deleteReview("${review_id}"); class="delete" type="button"></button>
                            </div>
                        </div>`;
            div.innerHTML = html_temp;

            // 시간 역순으로 보이게 만들기 위해 구현한 코드(서버 측에서 정렬이 되지 않아 주석처리)
            // if (reviewCards.length > 0) {
            //     console.log(reviewCards[0]);
            //     reviewsContainer.insertBefore(div, reviewCards[0]);
            // } else {
            //     reviewsContainer.appendChild(div);
            // }
            reviewsContainer.appendChild(div);
        }

    })
}

function deleteReview(review_id) {
    $.ajax({
        type: "POST",
        url: `/api/reviews/${review_id}/delete`,
        data: {},
        success: function (res) {
            const reviewsContainer = document.getElementById('reviewsContainer');
            const target_review = document.getElementById(review_id);
            console.log(target_review);
            reviewsContainer.removeChild(target_review);
        }
    })
}

function sign_in() {
    let username = $("#input-username").val()
    let password = $("#input-password").val()

    if (username == "") {
        $("#help-id-login").text("아이디를 입력해주세요.")
        $("#input-username").focus()
        return;
    } else {
        $("#help-id-login").text("")
    }

    if (password == "") {
        $("#help-password-login").text("비밀번호를 입력해주세요.")
        $("#input-password").focus()
        return;
    } else {
        $("#help-password-login").text("")
    }
    $.ajax({
        type: "POST",
        url: "/sign_in",
        data: {
            username_give: username,
            password_give: password
        },
        success: function (response) {
            if (response['result'] == 'success') {
                $.cookie('mytoken', response['token'], {path: '/'}); //cookie 브라우저 데이터베이스(키-밸류형태로 저장) mytoken이라는 '키'가 실제 서버가 발행한 jwt토큰(response[token])을 저장하고 있다고 하고
                alert('로그인 성공!')
                window.location.replace("/main")
            } else {
                alert(response['msg'])
            }
        }
    });
}

function login_blur() {
    console.log("onblur 실행완료")
    $("#login-box").removeClass("is-white is-shadow").addClass("is-blue")
    $("#input-username").removeClass("is-white auto-input").addClass("is-blue off-auto-complete")
    $("#input-nickname").removeClass("is-white").addClass("is-blue")
    $("#input-password").removeClass("is-white").addClass("is-blue")
    $("#input-password2").removeClass("is-white").addClass("is-blue")
    $("#login-btn").removeClass("is-white").addClass("is-blue")
    $(".join-btn").removeClass("is-white").addClass("is-blue")
    $("#login-register-btn").removeClass("is-white").addClass("is-blue")
    $(".id-box").removeClass("is-white").addClass("is-blue")
    $(".id-check-box").removeClass("is-white").addClass("is-blue")
    $(".nickname-check-box").removeClass("is-white").addClass("is-blue")
    $(".password-box").removeClass("is-white").addClass("is-blue")
    $(".fa-user").removeClass("is-white").addClass("is-blue")
    $(".fa-lock").removeClass("is-white").addClass("is-blue")
    $(".fa-star").removeClass("is-white").addClass("is-blue")
}

function login_focus() {
    console.log("onfocus 실행완료")
    $("#login-box").removeClass("is-blue").addClass("is-white is-shadow")
    $("#input-username").removeClass("is-blue off-auto-complete").addClass("is-white auto-complete")
    $("#input-nickname").removeClass("is-blue").addClass("is-white")
    $("#input-password").removeClass("is-blue").addClass("is-white")
    $("#input-password2").removeClass("is-blue").addClass("is-white")
    $("#login-btn").removeClass("is-blue").addClass("is-white")
    $(".join-btn").removeClass("is-blue").addClass("is-white")
    $("#login-register-btn").removeClass("is-blue").addClass("is-white")
    $(".id-box").removeClass("is-blue").addClass("is-white")
    $(".id-check-box").removeClass("is-blue").addClass("is-white")
    $(".nickname-check-box").removeClass("is-blue").addClass("is-white")
    $(".password-box").removeClass("is-blue").addClass("is-white")
    $(".fa-user").removeClass("is-blue").addClass("is-white")
    $(".fa-lock").removeClass("is-blue").addClass("is-white")
    $(".fa-star").removeClass("is-blue").addClass("is-white")

}


function is_id(asValue) {
    var regExp = /^(?=.*[a-zA-Z])[-a-zA-Z0-9_.]{2,10}$/;
    //아이디 조건: a-zA-Z(영문필수(소괄호가 필수)) / [대괄호]일반적인거 a-zA-Z 0-9 _. 들이 들어갈 수있고 / {중괄호}2~10개의 문자
    return regExp.test(asValue);
}

function is_nickname(asValue) {
    var regExp = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|\*]{2,10}$/;

    return regExp.test(asValue);


}

function is_password(asValue) {
    var regExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*]{8,20}$/;
    //비밀번호 조건: ()필수, \d는 숫자 의미, a-zA-Z 숫자, 영어 모두 필수, 8-20자
    return regExp.test(asValue);
}

function join_focus_id() {
    console.log("onfocus 실행완료")
    $("#input-username").val('')
    $("#help-id").text("").removeClass("is-safe")
}

function join_focus_nickname() {
    $("#input-nickname").val('')
    $("#help-nickname").text("").removeClass("is-safe")
}


function sign_up() {
    let username = $("#input-username").val()
    let nickname = $("#input-nickname").val()
    let password = $("#input-password").val()
    let password2 = $("#input-password2").val()
    console.log(username, nickname, password, password2)

    if (username == "") {
        $("#help-id").text("아이디를 입력해주세요.").removeClass("is-safe").addClass("is-danger")
        return;
    } else if ($("#help-id").hasClass("is-danger")) {
        $("#help-id").text("아이디를 확인해주세요.")
        return;
    } else if (!$("#help-id").hasClass("is-success")) {
        $("#help-id").text("아이디 중복확인을 해주세요.").addClass("is-danger")
        return;
    }

    if (nickname == "") {
        $("#help-nickname").text("닉네임을 입력해주세요.").removeClass("is-safe").addClass("is-danger")
        return;
    } else if ($("#help-nickname").hasClass("is-danger")) {
        $("#help-nickname").text("닉네임을 확인해주세요.")
        return;
    } else if (!$("#help-nickname").hasClass("is-success")) {
        $("#help-nickname").text("닉네임 중복확인을 해주세요.").addClass("is-danger")
        return;
    }

    if (password == "") {
        $("#help-password").text("비밀번호를 입력해주세요.").removeClass("is-safe").addClass("is-danger")
        $("#input-password").focus()
        return;
    } else if (!is_password(password)) {
        $("#help-password").text("비밀번호의 형식을 확인해주세요. 영문과 숫자 필수 포함, 특수문자(!@#$%^&*) 사용가능 8-20자").removeClass("is-safe").addClass("is-danger")
        $("#input-password").focus()
        return
    } else {
        $("#help-password").text("사용할 수 있는 비밀번호입니다.").removeClass("is-danger").addClass("is-success")
    }
    if (password2 == "") {
        $("#help-password2").text("비밀번호를 입력해주세요.").removeClass("is-safe").addClass("is-danger")
        $("#input-password2").focus()
        return;
    } else if (password2 != password) {
        $("#help-password2").text("비밀번호가 일치하지 않습니다.").removeClass("is-safe").addClass("is-danger")
        $("#input-password2").focus()
        return;
    } else {
        $("#help-password2").text("비밀번호가 일치합니다.").removeClass("is-danger").addClass("is-success")
    }
    $.ajax({ //위의 테스트들을 만족하면 서버로 나 이 정보로 회원가입할게 요청을 보낸다
        type: "POST",
        url: "/join/sign_up/save",
        data: {
            username_give: username,
            nickname_give: nickname,
            password_give: password
        },
        success: function (response) {
            alert("회원가입을 축하드립니다!")
            window.location.replace("/login")
        }
    });

}

function check_dup_id() {
    let username = $("#input-username").val()
    console.log(username)
    if (username == "") {
        $("#help-id").text("아이디를 입력해주세요.").removeClass("is-safe").addClass("is-danger")

        return;
    }
    if (!is_id(username)) { //아이디 조건을 컴퓨터말로 적어준 거..., 아이디 조건 맞아서 true이면 밑에 아이디 형식 똑바로 하세요 안 띄워야하니까 !붙여서 true 아닌 false로
        $("#help-id").text("아이디의 형식을 확인해주세요. 영문과 숫자, 일부 특수문자(._-) 사용 가능. 2-10자 길이").removeClass("is-safe").addClass("is-danger") //safe, danger 클래스를 먹이면 됨

        return;
    }
    $("#help-id").addClass("is-loading")

    $.ajax({  //이 아이디가 기존에 있는 것인지 확인 위해, ajax 사용해서 서버에 요청한다(중복확인)
        type: "POST",
        url: "/join/sign_up/check_dup_id",
        data: {
            username_give: username
        },
        success: function (response) {

            if (response["exists"]) {
                $("#help-id").text("이미 존재하는 아이디입니다.").removeClass("is-safe").addClass("is-danger")

            } else {
                $("#help-id").text("사용할 수 있는 아이디입니다.").removeClass("is-danger").addClass("is-success")
            }
            $("#help-id").removeClass("is-loading")

        }
    });
}

function check_dup_nickname() {
    let nickname = $("#input-nickname").val()
    console.log(nickname)
    if (nickname == "") {
        $("#help-nickname").text("닉네임을 입력해주세요.").removeClass("is-safe").addClass("is-danger")

        return;
    }
    if (!is_nickname(nickname)) {
        $("#help-nickname").text("닉네임의 형식을 확인해주세요. 한글, 영문, 숫자 사용 가능. 2-10자 길이").removeClass("is-safe").addClass("is-danger") //safe, danger 클래스를 먹이면 됨

        return;
    }
    $("#help-nick").addClass("is-loading")

    $.ajax({  //이 아이디가 기존에 있는 것인지 확인 위해, ajax 사용해서 서버에 요청한다(중복확인)
        type: "POST",
        url: "/join/sign_up/check_dup_nickname",
        data: {
            nickname_give: nickname
        },
        success: function (response) {

            if (response["exists"]) {
                $("#help-nickname").text("이미 존재하는 닉네임입니다.").removeClass("is-safe").addClass("is-danger")

            } else {
                $("#help-nickname").text("사용할 수 있는 닉네임입니다.").removeClass("is-danger").addClass("is-success")
            }
            $("#help-nickname").removeClass("is-loading")

        }
    });
}


function init() {
    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => saveReview(e));
    }
}

init();