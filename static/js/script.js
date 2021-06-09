function toggle_like(id) {
    const likes = document.querySelectorAll('.likes');
    const likes_array = Array.prototype.slice.call(likes);
    const target_btn = likes_array.find((btn) => Number(btn.dataset.id) === Number(id));
    if (target_btn.classList.contains('like-btn')) {
        target_btn.innerHTML = '<i class="fa fa-heart" aria-hidden="true"></i>';
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
        target_btn.innerHTML = '<i class="fa fa-heart-o" aria-hidden="true"></i>';
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