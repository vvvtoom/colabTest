const state = {
	employees: [
		"김민수",
		"이서연",
		"박지훈",
		"최유진",
		"정하늘",
		"한지민",
		"오세훈",
		"윤소라",
		"강도윤",
		"임나래",
	],
	selectedEmployee: "김민수",
	attendance: {},
	expenses: [
		{
			id: "EXP-SAMPLE-001",
			employee: "김민수",
			account: {
				gwan: "운영비",
				hang: "사무행정",
				mok: "소모품비",
			},
			approvers: {
				staff: "",
				director: "",
				finance: "",
				pastor: "",
			},
			proposalDate: "2026-03-05",
			expenseDate: "2026-03-04",
			deptName: "관리부",
			claimant: "김민수",
			items: [
				{
					summary: "프린터 토너 구매",
					amount: 98000,
					note: "사무실 비품",
				},
				{
					summary: "복사용지 구매",
					amount: 42000,
					note: "A4 5박스",
				},
			],
			totalAmount: 140000,
			attachments: ["receipt-toner.jpg", "invoice-paper.pdf"],
			status: "대기",
			stamped: false,
			rejectionReason: "",
			createdAt: "2026-03-05T09:10:00+09:00",
		},
	],
	selectedExpenseId: "EXP-SAMPLE-001",
};

const initialAttendanceByEmployee = {
	김민수: { status: "출근", tripLocation: "" },
	이서연: { status: "출장", tripLocation: "부산 지사" },
	박지훈: { status: "휴가", tripLocation: "" },
	최유진: { status: "출근", tripLocation: "" },
	정하늘: { status: "출장", tripLocation: "대전 파트너사" },
	한지민: { status: "출근", tripLocation: "" },
	오세훈: { status: "휴가", tripLocation: "" },
	윤소라: { status: "출장", tripLocation: "광주 고객사" },
	강도윤: { status: "출근", tripLocation: "" },
	임나래: { status: "휴가", tripLocation: "" },
};

state.employees.forEach((name) => {
	const initial = initialAttendanceByEmployee[name] || {
		status: "출근",
		tripLocation: "",
	};
	state.attendance[name] = {
		status: initial.status,
		tripLocation: initial.tripLocation,
		updatedAt: new Date().toISOString(),
	};
});

const pages = {
	employeeAttendance: document.getElementById("employee-attendance"),
	adminAttendance: document.getElementById("admin-attendance"),
	employeeExpense: document.getElementById("employee-expense"),
	adminExpense: document.getElementById("admin-expense"),
};

const STATUS = ["출근", "출장", "휴가"];

function formatDateTime(iso) {
	if (!iso) return "-";
	return new Date(iso).toLocaleString("ko-KR");
}

function statusBadge(status) {
	return `<span class="status-pill status-${status}">${status}</span>`;
}

function setActivePage(pageId) {
	document.querySelectorAll(".tabs button").forEach((btn) => {
		btn.classList.toggle("active", btn.dataset.page === pageId);
	});
	document.querySelectorAll(".page").forEach((page) => {
		page.classList.toggle("active", page.id === pageId);
	});
}

function renderEmployeeAttendancePage() {
	const current = state.attendance[state.selectedEmployee];
	pages.employeeAttendance.innerHTML = `
    <div class="card">
      <h2>사원 - 근태 표시 및 확인</h2>
      <p class="muted">본인의 현재 상태를 설정합니다.</p>
      <div class="row">
        <div class="inline-field">
          <label>사원 선택</label>
          <select id="employeeSelect">
            ${state.employees
			.map(
				(name) =>
					`<option value="${name}" ${name === state.selectedEmployee ? "selected" : ""}>${name}</option>`,
			)
			.join("")}
          </select>
        </div>
      </div>
      <div class="row" style="margin-top:12px">
        ${STATUS.map(
		(s) => `
            <label>
              <input type="radio" name="attendanceStatus" value="${s}" ${current.status === s ? "checked" : ""} />
              ${s}
            </label>
          `,
	).join("")}
      </div>
      <div class="row" style="margin-top:12px">
        <div class="inline-field">
          <label>출장지 (출장 선택 시 입력)</label>
          <input id="tripLocationInput" type="text" placeholder="예: 부산 지사" value="${current.tripLocation || ""}" />
        </div>
      </div>
      <div style="margin-top:12px">
        <button class="btn primary" id="saveAttendanceBtn">근태 저장</button>
      </div>
    </div>
    <div class="card">
      <h3>내 현재 상태</h3>
      <p>${statusBadge(current.status)} ${
		current.status === "출장" && current.tripLocation
			? `- ${current.tripLocation}`
			: ""
      }</p>
      <p class="muted">최근 수정: ${formatDateTime(current.updatedAt)}</p>
    </div>
  `;

	document.getElementById("employeeSelect").addEventListener(
		"change",
		(e) => {
			state.selectedEmployee = e.target.value;
			renderEmployeeAttendancePage();
		},
	);

	document.getElementById("saveAttendanceBtn").addEventListener(
		"click",
		() => {
			const status =
				document.querySelector(
					'input[name="attendanceStatus"]:checked',
				)?.value || "출근";
			const tripLocation = document
				.getElementById("tripLocationInput")
				.value.trim();
			state.attendance[state.selectedEmployee] = {
				status,
				tripLocation:
					status === "출장" ? tripLocation : "",
				updatedAt: new Date().toISOString(),
			};
			renderEmployeeAttendancePage();
			renderAdminAttendancePage();
		},
	);
}

function renderAdminAttendancePage() {
	pages.adminAttendance.innerHTML = `
    <div class="card">
      <h2>관리자 - 사원 근태 현황</h2>
      <p class="muted">출근/출장/휴가 상태를 한눈에 확인할 수 있습니다.</p>
      <table>
        <thead>
          <tr>
            <th>사원명</th>
            <th>상태</th>
            <th>출장지</th>
            <th>최근 수정</th>
          </tr>
        </thead>
        <tbody>
          ${state.employees
			.map((name) => {
				const record = state.attendance[name];
				return `
                <tr>
                  <td>${name}</td>
                  <td>${statusBadge(record.status)}</td>
                  <td>${record.status === "출장" ? record.tripLocation || "-" : "-"}</td>
                  <td>${formatDateTime(record.updatedAt)}</td>
                </tr>
              `;
			})
			.join("")}
        </tbody>
      </table>
    </div>
  `;
}

function makeExpenseRowsInput() {
	return Array.from({ length: 8 })
		.map(
			(_, i) => `
      <tr>
        <td><input type="text" class="item-summary" data-row="${i}" placeholder="사용 내역" /></td>
        <td style="width:180px"><input type="number" min="0" class="item-amount" data-row="${i}" placeholder="0" /></td>
        <td style="width:220px"><input type="text" class="item-note" data-row="${i}" placeholder="비고" /></td>
      </tr>
    `,
		)
		.join("");
}

function getDraftExpenseTotalAmount() {
	return Array.from(document.querySelectorAll(".item-amount")).reduce(
		(sum, input) => {
			const amount = Number(input.value || 0);
			return sum + (Number.isFinite(amount) ? amount : 0);
		},
		0,
	);
}

function updateDraftExpenseTotalView() {
	const totalField = document.getElementById("draftTotalAmount");
	if (!totalField) return;
	totalField.value = formatCurrency(getDraftExpenseTotalAmount());
}

function renderEmployeeExpensePage() {
	pages.employeeExpense.innerHTML = `
    <div class="card">
      <h2>사원 - 지출결의서 작성</h2>
      <p class="muted">양식은 원본 지출결의서와 유사한 레이아웃으로 구성했습니다.</p>
      <div class="expense-sheet">
        <div class="expense-title">지출결의서</div>

        <div class="expense-top-grid">
          <div class="boxed">
            <div class="box-title">계정과목</div>
            <div class="account-grid">
              <div>관</div><div><input id="accGwan" type="text" /></div>
              <div>항</div><div><input id="accHang" type="text" /></div>
              <div>목</div><div><input id="accMok" type="text" /></div>
            </div>
          </div>

          <div class="boxed">
            <div class="sign-grid">
              <div class="head">담당</div>
              <div class="head">사무국장</div>
              <div class="head">재정위원</div>
              <div class="head">담임목사</div>
            </div>
          </div>
        </div>

        <table class="date-row">
          <tr>
            <th style="width:180px">지출결의일</th>
            <td><input id="proposalDate" type="date" /></td>
            <th style="width:160px">지출일자</th>
            <td><input id="expenseDate" type="date" /></td>
          </tr>
        </table>

        <table class="detail-row">
          <thead>
            <tr>
              <th>적요</th>
              <th style="width:180px">금액</th>
              <th style="width:220px">비고</th>
            </tr>
          </thead>
          <tbody>
            ${makeExpenseRowsInput()}
          </tbody>
          <tfoot>
            <tr>
              <th>합계</th>
              <th>
                <input id="draftTotalAmount" type="text" value="${formatCurrency(0)}" readonly />
              </th>
              <th></th>
            </tr>
          </tfoot>
        </table>

        <div class="bottom-sign">
          <div>
            <strong>담당부서</strong>
            <input id="deptName" type="text" placeholder="예: 관리부" />
          </div>
          <div>
            <strong>청구자</strong>
            <input id="claimant" type="text" placeholder="이름" />
          </div>
          <div>인</div>
        </div>
      </div>

      <div style="margin-top:14px" class="row">
        <div class="inline-field">
          <label>첨부 파일 (사진/문서)</label>
          <input id="attachmentInput" type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.hwp" />
        </div>
      </div>

      <div style="margin-top:14px">
        <button class="btn primary" id="submitExpenseBtn">지출결의서 제출</button>
      </div>
    </div>
  `;

	document.querySelectorAll(".item-amount").forEach((input) => {
		input.addEventListener("input", updateDraftExpenseTotalView);
	});
	updateDraftExpenseTotalView();

	document.getElementById("submitExpenseBtn").addEventListener(
		"click",
		() => {
			const items = Array.from(
				document.querySelectorAll(".item-summary"),
			).map((input, idx) => {
				const amount = Number(
					document.querySelector(
						`.item-amount[data-row="${idx}"]`,
					)?.value || 0,
				);
				const note =
					document.querySelector(
						`.item-note[data-row="${idx}"]`,
					)?.value || "";
				return {
					summary: input.value.trim(),
					amount,
					note: note.trim(),
				};
			});

			const filteredItems = items.filter(
				(it) => it.summary || it.amount || it.note,
			);
			const totalAmount = filteredItems.reduce(
				(sum, it) =>
					sum +
					(Number.isFinite(it.amount)
						? it.amount
						: 0),
				0,
			);
			const attachments = Array.from(
				document.getElementById("attachmentInput")
					.files || [],
			).map((f) => f.name);

			const newExpense = {
				id: `EXP-${Date.now()}`,
				employee: state.selectedEmployee,
				account: {
					gwan: document
						.getElementById("accGwan")
						.value.trim(),
					hang: document
						.getElementById("accHang")
						.value.trim(),
					mok: document
						.getElementById("accMok")
						.value.trim(),
				},
				approvers: {
					staff: document
						.getElementById("approverStaff")
						.value.trim(),
					director: document
						.getElementById(
							"approverDirector",
						)
						.value.trim(),
					finance: document
						.getElementById(
							"approverFinance",
						)
						.value.trim(),
					pastor: document
						.getElementById(
							"approverPastor",
						)
						.value.trim(),
				},
				proposalDate:
					document.getElementById("proposalDate")
						.value,
				expenseDate:
					document.getElementById("expenseDate")
						.value,
				deptName: document
					.getElementById("deptName")
					.value.trim(),
				claimant: document
					.getElementById("claimant")
					.value.trim(),
				items: filteredItems,
				totalAmount,
				attachments,
				status: "대기",
				stamped: false,
				rejectionReason: "",
				createdAt: new Date().toISOString(),
			};

			state.expenses.unshift(newExpense);
			state.selectedExpenseId = newExpense.id;
			renderAdminExpensePage();
			alert("지출결의서가 제출되었습니다.");
			renderEmployeeExpensePage();
		},
	);
}

function formatCurrency(value) {
	return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function expenseStatusBadge(status) {
	const cls =
		status === "승인"
			? "status-출근"
			: status === "거절"
				? "status-휴가"
				: "status-출장";
	return `<span class="status-pill ${cls}">${status}</span>`;
}

function makeReadonlyRows(items) {
	const cloned = [...items];
	while (cloned.length < 8)
		cloned.push({ summary: "", amount: 0, note: "" });
	return cloned
		.slice(0, 8)
		.map(
			(it) => `
      <tr>
        <td>${it.summary || ""}</td>
        <td>${it.amount ? formatCurrency(it.amount) : ""}</td>
        <td>${it.note || ""}</td>
      </tr>
    `,
		)
		.join("");
}

function expenseDetailTemplate(expense) {
	if (!expense) {
		return `<div class="card"><p class="muted">왼쪽 목록에서 결의서를 선택하세요.</p></div>`;
	}

	return `
    <div class="card">
      <div class="row" style="justify-content:space-between; align-items:center;">
        <h3 style="margin:0">지출결의서 상세</h3>
        <div>${expenseStatusBadge(expense.status)}</div>
      </div>
      <p class="muted">문서번호: ${expense.id} / 작성자: ${expense.employee} / 작성일: ${formatDateTime(expense.createdAt)}</p>

      <div class="expense-sheet">
        <div class="expense-title">지출결의서</div>
        <div class="expense-top-grid">
          <div class="boxed">
            <div class="box-title">계정과목</div>
            <div class="account-grid">
              <div>관</div><div>${expense.account.gwan || ""}</div>
              <div>항</div><div>${expense.account.hang || ""}</div>
              <div>목</div><div>${expense.account.mok || ""}</div>
            </div>
          </div>
          <div class="boxed">
            <div class="sign-grid">
              <div class="head">담당</div>
              <div class="head">사무국장</div>
              <div class="head">재정위원</div>
              <div class="head">담임목사</div>
              <div class="sign-cell">${expense.approvers.staff || ""}</div>
              <div class="sign-cell">
                ${expense.approvers.director || ""}
                ${expense.stamped ? `<img class="stamp" src="./stamp.jpg" alt="승인도장" />` : ""}
              </div>
              <div class="sign-cell">${expense.approvers.finance || ""}</div>
              <div class="sign-cell">${expense.approvers.pastor || ""}</div>
            </div>
          </div>
        </div>

        <table class="date-row">
          <tr>
            <th style="width:180px">지출결의일</th>
            <td>${expense.proposalDate || ""}</td>
            <th style="width:160px">지출일자</th>
            <td>${expense.expenseDate || ""}</td>
          </tr>
        </table>

        <table class="detail-row">
          <thead>
            <tr>
              <th>적요</th>
              <th style="width:180px">금액</th>
              <th style="width:220px">비고</th>
            </tr>
          </thead>
          <tbody>
            ${makeReadonlyRows(expense.items)}
          </tbody>
          <tfoot>
            <tr>
              <th>합계</th>
              <th>${formatCurrency(expense.totalAmount)}</th>
              <th></th>
            </tr>
          </tfoot>
        </table>

        <div class="bottom-sign">
          <div><strong>담당부서</strong> ${expense.deptName || ""}</div>
          <div><strong>청구자</strong> ${expense.claimant || ""}</div>
          <div>인</div>
        </div>
      </div>

      <div style="margin-top:12px">
        <strong>첨부 파일:</strong>
        ${
		expense.attachments.length
			? expense.attachments
					.map(
						(n) =>
							`<span class="status-pill status-출장">${n}</span>`,
					)
					.join(" ")
			: "<span class='muted'>없음</span>"
	}
      </div>

      ${
		expense.status === "거절"
			? `<p style="margin-top:10px; color:#991b1b;"><strong>거절 사유:</strong> ${expense.rejectionReason || "사유 없음"}</p>`
			: ""
      }

      <div style="margin-top:12px" class="row">
        <button id="approveExpenseBtn" class="btn success">승인</button>
        <button id="rejectExpenseBtn" class="btn danger">거절</button>
      </div>
    </div>
  `;
}

function renderAdminExpensePage() {
	const selected =
		state.expenses.find((e) => e.id === state.selectedExpenseId) ||
		null;

	pages.adminExpense.innerHTML = `
    <div class="card">
      <h2>관리자 - 지출결의서 목록/결재</h2>
      <p class="muted">자세히 보기 후 승인/거절 처리할 수 있습니다. 승인 시 사무국장 칸에 도장이 표시됩니다.</p>
      <div class="two-cols">
        <div>
          ${
			state.expenses.length
				? state.expenses
						.map(
							(expense) => `
                  <div class="list-item">
                    <div><strong>${expense.id}</strong> ${expenseStatusBadge(expense.status)}</div>
                    <div class="muted">${expense.employee} / ${expense.proposalDate || "-"} / 합계 ${formatCurrency(
				expense.totalAmount,
			)}</div>
                    <div style="margin-top:8px">
                      <button class="btn view-expense-btn" data-id="${expense.id}">자세히 보기</button>
                    </div>
                  </div>
                `,
						)
						.join("")
				: `<p class="muted">제출된 지출결의서가 없습니다.</p>`
		}
        </div>
        <div>
          ${expenseDetailTemplate(selected)}
        </div>
      </div>
    </div>
  `;

	document.querySelectorAll(".view-expense-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			state.selectedExpenseId = btn.dataset.id;
			renderAdminExpensePage();
		});
	});

	const approveBtn = document.getElementById("approveExpenseBtn");
	const rejectBtn = document.getElementById("rejectExpenseBtn");
	if (approveBtn && selected) {
		approveBtn.addEventListener("click", () => {
			selected.status = "승인";
			selected.stamped = true;
			selected.rejectionReason = "";
			renderAdminExpensePage();
		});
	}
	if (rejectBtn && selected) {
		rejectBtn.addEventListener("click", () => {
			const reason = prompt(
				"거절 사유를 입력하세요.",
				selected.rejectionReason || "",
			);
			selected.status = "거절";
			selected.stamped = false;
			selected.rejectionReason = reason || "";
			renderAdminExpensePage();
		});
	}
}

function initTabs() {
	document.getElementById("tabs").addEventListener("click", (e) => {
		const btn = e.target.closest("button[data-page]");
		if (!btn) return;
		setActivePage(btn.dataset.page);
	});
}

function init() {
	initTabs();
	renderEmployeeAttendancePage();
	renderAdminAttendancePage();
	renderEmployeeExpensePage();
	renderAdminExpensePage();
}

init();
