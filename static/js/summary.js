(function () {
    "use strict";

    var DATA = window.__SUMMARY_DATA__;
    var finalSubmitBtn = document.getElementById("final-submit-btn");
    var submitError = document.getElementById("submit-error");

    finalSubmitBtn.addEventListener("click", function () {
        submitError.hidden = true;
        finalSubmitBtn.disabled = true;
        finalSubmitBtn.textContent = "در حال ارسال...";

        fetch(DATA.submitUrl, { method: "POST" })
            .then(function (res) {
                return res.json().then(function (data) {
                    if (!res.ok || !data.ok) {
                        throw new Error(data.error || "ارسال اطلاعات با خطا مواجه شد.");
                    }
                    return data;
                });
            })
            .then(function () {
                window.location.href = DATA.thanksUrl;
            })
            .catch(function (err) {
                submitError.textContent = err.message;
                submitError.hidden = false;
                finalSubmitBtn.disabled = false;
                finalSubmitBtn.textContent = "تایید و ارسال نهایی";
            });
    });
})();
