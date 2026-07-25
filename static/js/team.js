(function () {
    "use strict";

    var DATA = window.__TEAM_DATA__;
    var members = DATA.members.slice();

    var tbody = document.getElementById("member-tbody");
    var emptyState = document.getElementById("empty-state");
    var memberForm = document.getElementById("member-form");
    var nameInput = document.getElementById("member_name");
    var roleSelect = document.getElementById("member_role");
    var formError = document.getElementById("member-form-error");
    var addBtn = document.getElementById("add-member-btn");
    var nextStepBtn = document.getElementById("next-step-btn");

    var editingId = null;

    function showFormError(msg) {
        formError.textContent = msg;
        formError.hidden = false;
    }
    function hideFormError() {
        formError.hidden = true;
        formError.textContent = "";
    }

    function roleOptionsHtmlFor(selectedRole) {
        return DATA.roles
            .map(function (r) {
                var sel = r === selectedRole ? "selected" : "";
                return '<option value="' + escapeHtml(r) + '" ' + sel + ">" + escapeHtml(r) + "</option>";
            })
            .join("");
    }

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function render() {
        tbody.innerHTML = "";
        if (members.length === 0) {
            emptyState.hidden = false;
        } else {
            emptyState.hidden = true;
        }

        members.forEach(function (m, idx) {
            var tr = document.createElement("tr");
            tr.dataset.id = m.id;

            if (editingId === m.id) {
                tr.innerHTML =
                    '<td class="col-index">' + (idx + 1) + "</td>" +
                    '<td><input type="text" class="edit-input" data-field="name" value="' + escapeHtml(m.name) + '"></td>' +
                    '<td><select class="edit-select" data-field="role">' + roleOptionsHtmlFor(m.role) + "</select></td>" +
                    '<td class="td-actions">' +
                    '<button type="button" class="row-action-btn edit" data-action="save">ذخیره</button>' +
                    '<button type="button" class="row-action-btn delete" data-action="cancel-edit">انصراف</button>' +
                    "</td>";
            } else {
                var indexCell = document.createElement("td");
                indexCell.className = "col-index";
                indexCell.textContent = String(idx + 1);

                var nameCell = document.createElement("td");
                nameCell.textContent = m.name;

                var roleCell = document.createElement("td");
                roleCell.textContent = m.role;

                var actionsCell = document.createElement("td");
                actionsCell.className = "td-actions";

                var editBtn = document.createElement("button");
                editBtn.type = "button";
                editBtn.className = "row-action-btn edit";
                editBtn.dataset.action = "edit";
                editBtn.textContent = "ویرایش";

                var delBtn = document.createElement("button");
                delBtn.type = "button";
                delBtn.className = "row-action-btn delete";
                delBtn.dataset.action = "delete";
                delBtn.textContent = "حذف";

                actionsCell.appendChild(editBtn);
                actionsCell.appendChild(delBtn);

                tr.appendChild(indexCell);
                tr.appendChild(nameCell);
                tr.appendChild(roleCell);
                tr.appendChild(actionsCell);
            }

            tbody.appendChild(tr);
        });
    }

    function apiCall(url, method, body) {
        return fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
        }).then(function (res) {
            return res.json().then(function (data) {
                if (!res.ok || !data.ok) {
                    throw new Error(data.error || "خطای غیرمنتظره رخ داد.");
                }
                return data;
            });
        });
    }

    memberForm.addEventListener("submit", function (e) {
        e.preventDefault();
        hideFormError();

        var name = nameInput.value.trim();
        var role = roleSelect.value;

        if (!name) {
            showFormError("لطفاً نام عضو را وارد کنید.");
            return;
        }
        if (!role) {
            showFormError("لطفاً یک سمت انتخاب کنید.");
            return;
        }

        addBtn.disabled = true;
        apiCall(DATA.membersApiUrl, "POST", { name: name, role: role })
            .then(function (data) {
                members = data.members;
                nameInput.value = "";
                roleSelect.selectedIndex = 0;
                nameInput.focus();
                render();
            })
            .catch(function (err) {
                showFormError(err.message);
            })
            .finally(function () {
                addBtn.disabled = false;
            });
    });

    tbody.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-action]");
        if (!btn) return;
        var tr = btn.closest("tr");
        var id = parseInt(tr.dataset.id, 10);
        var action = btn.dataset.action;

        if (action === "edit") {
            editingId = id;
            render();
        } else if (action === "cancel-edit") {
            editingId = null;
            render();
        } else if (action === "delete") {
            if (!window.confirm("آیا از حذف این عضو مطمئن هستید؟")) return;
            apiCall(DATA.membersApiUrl + "/" + id, "DELETE")
                .then(function (data) {
                    members = data.members;
                    render();
                })
                .catch(function (err) {
                    window.alert(err.message);
                });
        } else if (action === "save") {
            var nameField = tr.querySelector('[data-field="name"]');
            var roleField = tr.querySelector('[data-field="role"]');
            var newName = nameField.value.trim();
            var newRole = roleField.value;

            if (!newName || !newRole) {
                window.alert("نام و سمت نمی‌توانند خالی باشند.");
                return;
            }

            apiCall(DATA.membersApiUrl + "/" + id, "PUT", { name: newName, role: newRole })
                .then(function (data) {
                    members = data.members;
                    editingId = null;
                    render();
                })
                .catch(function (err) {
                    window.alert(err.message);
                });
        }
    });

    nextStepBtn.addEventListener("click", function (e) {
        if (members.length < 1) {
            e.preventDefault();
            window.alert("لطفاً پیش از ادامه، حداقل یک عضو تیم ثبت کنید.");
        }
    });

    render();
})();
