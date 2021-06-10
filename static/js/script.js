const reviewForm = document.getElementById('reviewForm');

window.onpageshow = function(event) {
    if ( event.persisted || (window.performance && window.performance.navigation.type == 2)) {
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
    const webtoon_id = pathnameAry[pathnameAry.length -1];
    const textarea = document.getElementById("textarea-post");
    const review = textarea.value;

    if(!review || review.trim() == false) {
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
        success: function(res) {
            const reviewsContainer = document.getElementById('reviewsContainer');
            const {nickname, review_id} = res.result;
            console.log(typeof(review_id))
            const div = document.createElement('div');
            div.classList.add("review-container");
            div.setAttribute("id", review_id)
            let html_temp = `
                        <div class="review-card">
                            <span class="review-name"><strong>${nickname}</strong></span>
                            <p class="review-text">${review}</p>
                            <button onclick=deleteReview("${review_id}") class="delete" type="button"></button>
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
        success: function(res) {
            const reviewsContainer = document.getElementById('reviewsContainer');
            const target_review = document.getElementById(review_id);
            console.log(target_review);
            reviewsContainer.removeChild(target_review);
        }
    })
}


function init() {
    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => saveReview(e));
    }
}

init();