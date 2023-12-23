function isPass(student, course, grade) {
  const passGrades = new Set(["O", "A+", "A", "B+", "B", "C", "P"]);
  for (const g of grade) {
    if (passGrades.has(g)) {
      return true;
    }
  }
  return false;
}

function hasFailHistory(gradeHistory) {
  return gradeHistory.includes("F") || gradeHistory.includes("DT");
}

function closeSuggestedCourses() {
  document.getElementById("suggestedCourses").innerHTML = "";
  m.close();
}

function printReport(student, studentsData, categories, courseCategory, coursesData, specializationData) {
  prepareStudentsTable(student, studentsData, categories, courseCategory, coursesData, specializationData);
  return function (event) {
    event.preventDefault();
    print();
  };
}

function readCsv(fileName) {
  return new Promise((resolve, reject) => {
    fetch(fileName)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          const data = [];
          const rows = reader.result.split('\n');
          const headers = rows[0].split(',');

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i].split(',');
            if (row.length === headers.length) {
              const entry = {};
              headers.forEach((header, index) => {
                entry[header.trim()] = row[index].trim();
              });
              data.push(entry);
            }
          }

          resolve(data);
        };

        reader.onerror = () => {
          reject(new Error('Error reading the file'));
        };

        reader.readAsText(blob);
      })
      .catch(error => {
        reject(error);
      });
  });
}

function displaySuggestedCourses(student, category, courseCategory, coursesData, studentResultStatus) {
  return async function () {
    const tableContainer = document.getElementById("suggestedCourses");
    const closeButton = document.createElement("button");
    closeButton.onclick = closeSuggestedCourses;
    closeButton.textContent = "Close";
    tableContainer.appendChild(closeButton);
    const courses = [];
    for (const course in courseCategory) {
      if (courseCategory[course] === category) {
        courses.push(course);
      }
    }
    
    const title = document.createElement("h3");
    title.textContent = category;
    tableContainer.appendChild(title);

    const title2 = document.createElement("h3");
    title2.textContent = "All Courses";
    tableContainer.appendChild(title2);
    const table = document.createElement("table");
    table.border = 1;
    const header = ["Course Code", "Course Name"];
    const headerRow = document.createElement("tr");
    for (const headerEle of header) {
      const th = document.createElement("th");
      th.textContent = headerEle;
      headerRow.appendChild(th);
    }
    table.appendChild(headerRow);
    for (const course of courses) {
      const tr = document.createElement("tr");
      const courseCode = document.createElement("td");
      courseCode.textContent = course;
      const courseTitle = document.createElement("td");
      courseTitle.textContent = coursesData[course];
      tr.appendChild(courseCode);
      tr.appendChild(courseTitle);
      table.appendChild(tr);
    }
    tableContainer.appendChild(table);

    const studentResults = studentResultStatus[student];
    
    const secondTitle = document.createElement("h3");
    secondTitle.textContent = "Registered Courses";
    tableContainer.appendChild(secondTitle);

    const registrationTable = document.createElement("table");
    registrationTable.border = 1;
    const row1 = document.createElement("tr");
    const header1 = document.createElement("th");
    const header2 = document.createElement("th");
    header1.textContent = "Course Code";
    header2.textContent = "Result Status";
    row1.append(header1);
    row1.append(header2);
    registrationTable.append(row1);

    for (const course of courses) {
      if (course in studentResults) {
        const row = document.createElement("tr");
        row.style.textAlign = "center";
        const ele = document.createElement("td");
        ele.textContent = course;
        const ele2 = document.createElement("td");
        ele2.textContent = studentResults[course];
        row.append(ele);
        row.append(ele2);
        registrationTable.append(row);
      }
    }

    tableContainer.append(registrationTable);
    m.showModal();
  } 
}

function prepareStudentsTable(student, studentsData, categories, courseCategory, coursesData, specializationData, studentResultStatus) {
  const tableContainer = document.getElementById("tableContainer");
  tableContainer.innerHTML = "";
  
  if (studentsData[student]) {
    const infoTable = document.createElement("table");
    infoTable.border = 1;
    const h = {
      "reg_no": "Registration No",
      "name": "Name",
      "specialization": "Specialization",
    };
    const titleRow = document.createElement("tr");

    for (const title in h) {
      const titleElement = document.createElement("td");
      titleElement.style.textAlign = "center";
      titleElement.style.fontWeight = "bold";
      titleElement.textContent = h[title];
      titleRow.appendChild(titleElement);
    }

    const valuesRow = document.createElement("tr");

    for (const title in h) {
      const valueElement = document.createElement("td");
      valueElement.style.textAlign = "center";
      valueElement.textContent = specializationData[student][title];
      valuesRow.append(valueElement);
    }

    infoTable.appendChild(titleRow);
    infoTable.appendChild(valuesRow);
    infoTable.style.marginBottom = "1rem";

    tableContainer.appendChild(infoTable);

    const studentData = studentsData[student];
    const table = document.createElement("table");
    table.border = 1;
    const headerRow = document.createElement("tr");

    const headers = ["Category", "Courses Completed", "Courses Due", "Credits Acquired", "Credits Due", "Completion Status"];
    for (const header of headers) {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    }

    table.appendChild(headerRow);

    const rows = [];

    for (const category of categories) {
      if (!category) continue;
      const tr = document.createElement("tr");
      const row = [category, studentData[category]["coursesDone"], studentData[category]["coursesRequired"], studentData[category]["creditsAcquired"], studentData[category]["creditsRequired"]];
      for (const ele of row) {
        const td = document.createElement("td");
        td.textContent = ele;
        td.style.textAlign = "center";
        tr.appendChild(td);
      }
      const td = document.createElement("td");
      td.style.textAlign = "center";
      if (studentData[category]["coursesRequired"] === 0 && studentData[category]["creditsRequired"] === 0) {
        td.textContent = "Completed";
      } else {
        const anchor = document.createElement("a");
        anchor.href="#";
        anchor.innerHTML = "Incomplete - Click for more information";
        anchor.onclick = displaySuggestedCourses(student, category, courseCategory, coursesData, studentResultStatus);
        td.appendChild(anchor);
      }
      
      tr.appendChild(td);
      table.appendChild(tr);
    }

    // for (const row of rows) {
    //   const tr = document.createElement("tr");
    //   for (const column of row) {
    //     const td = document.createElement("td");
    //     td.textContent = column;
    //     tr.appendChild(td);
    //   }
    //   table.appendChild(tr);
    // }

    const honorsTable = document.createElement("table");
    honorsTable.border = 1;
    const additionalCreditsRow = document.createElement("tr");
    additionalCreditsRow.style.textAlign = "center";
    const additionalCreditsTitle = document.createElement("td");
    additionalCreditsTitle.innerHTML = "<b>Additional Credits</b>";

    const additionalCreditsValue = document.createElement("td");
    additionalCreditsValue.textContent = studentData["additionalCredits"];

    additionalCreditsRow.appendChild(additionalCreditsTitle);
    additionalCreditsRow.appendChild(additionalCreditsValue);

    const honorsEligibilityRow = document.createElement("tr");
    const honorsEligibilityRowTitle = document.createElement("td");
    honorsEligibilityRowTitle.innerHTML = "<b>Honors Eligibility</b>";
    const honorsEligibilityStatus = document.createElement("td");
    honorsEligibilityStatus.innerHTML = studentData["honorsEligible"] ? "<b>YES</b>" : "<b>NO</b>";

    const commentsRow = document.createElement("tr");
    const commentTitle = document.createElement("td");
    commentTitle.innerHTML = "<b>Comments</b>";
    const comment = document.createElement("td");
    comment.textContent = studentData["comment"];
    commentsRow.appendChild(commentTitle);
    commentsRow.appendChild(comment);

    honorsEligibilityRow.appendChild(honorsEligibilityRowTitle);
    honorsEligibilityRow.appendChild(honorsEligibilityStatus);

    honorsEligibilityRowTitle.style.textAlign = "center";
    honorsEligibilityStatus.style.textAlign = "center";

    honorsTable.appendChild(honorsEligibilityRow);
    honorsTable.appendChild(additionalCreditsRow);
    honorsTable.appendChild(commentsRow);

    honorsTable.style.marginTop = "1rem";

    tableContainer.appendChild(table);
    tableContainer.appendChild(honorsTable);
  } else {
    alert("Enter a valid Student ID number");
  }
}

async function getDataFromCsv(filePath) {
  const response = await fetch(filePath);
  const textData = await response.text();
  return new Promise((reslove, reject) => {
    Papa.parse(textData, {
      header: true,
      complete: function (results) {
        reslove(results.data);
      },
      error: function (err) {
        reject("Error parsing CSV: ", err);
      }
    });
  });
}

document.getElementById("studentform").addEventListener("submit", async function (event) {
  event.preventDefault();
  const studentRegNo = document.getElementById("studentId").value.trim();
  if (studentRegNo.length === 0) {
    alert("Enter Student ID Number");
    return;
  }

  const requirementsPath = "requirements3.csv";
  const studentsPath = "students5.csv";
  const creditsPath = "credits3.csv";
  const specializationPath = "specialization.csv";
  const resultPendingPath = "reg.csv";

  const [requirementsData, studentsData, creditsData, specializationData, resultPendingData] = await Promise.all([
    getDataFromCsv(requirementsPath),
    getDataFromCsv(studentsPath),
    getDataFromCsv(creditsPath),
    getDataFromCsv(specializationPath),
    getDataFromCsv(resultPendingPath)
  ]);

  const studentResultStatus = {};
  for (const row of studentsData) {
    if (!(row["reg_no"] in studentResultStatus)) {
      studentResultStatus[row["reg_no"]] = {};
    }
    studentResultStatus[row["reg_no"]][row["code"]] = "Declared";
  }

  for (const row of resultPendingData) {
    if (!(row["reg_no"] in studentResultStatus)) {
      studentResultStatus[row["reg_no"]] = {};
    }
    studentResultStatus[row["reg_no"]][row["code"]] = "Yet to be Declared";
  }

  const courseCategory = {};
  const course = {};
  const categories = new Set();
  const students = {};
  const studentRegisteredCourses = {};

  const studentInfo = {};
  for (const row of specializationData) {
    studentInfo[row["reg_no"]] = {
      "reg_no": row["reg_no"],
      "name": row["name"],
      "specialization": row["specialization"],
    };
  }

  const studentFailHistory = {};

  for (const row of requirementsData) {
    const category = row["category"];
    const code = row["code"];
    const title = row["title"];

    categories.add(category);
    if (!(category in courseCategory)) {
      courseCategory[code] = category;
    }
    course[code] = title;
  }

  for (const row of studentsData) {
    const regNo = row["reg_no"];
    if (!regNo) {
      continue;
    }
    const code = row["code"];
    const grade = row["grade"];
    const credits = row["credits"];

    if (!(regNo in students)) {
      students[regNo] = [];
      studentRegisteredCourses[regNo] = new Set();
    }
    
    let r = [];
    if (grade.length <= 2) {
      r.push(grade);
    } else {
      const idx = grade.indexOf("(");
      const idx2 = grade.indexOf(")");
      const substr = grade.substring(idx + 1, idx2);
      r = substr.split(",");
    }

    if (isPass(regNo, code, r)) {
      const result = [code, credits];
      students[regNo].push(result);
    }
    if (!(regNo in studentFailHistory)) {
      studentFailHistory[regNo] = false;
    }
    if (hasFailHistory(grade)) {
      studentFailHistory[regNo] = true;
    }
    studentRegisteredCourses[regNo].add(code);
  }

  const a = {};
  const b = {};
  for (const row of creditsData) {
    const category = row["category"];
    const minCourses = row["min_courses"];
    const minCredits = row["min_credits"];

    try {
      a[category] = parseInt(minCourses);
      b[category] = parseFloat(minCredits);
    } catch (e) {}
  }

  const additionalCreditCategories = new Set(["Basic Sciences (BS)", "Professional Core (PC)", "Skill Development Core Courses (SDC)", "Skill Development Elective Courses (SDC ELEC)", "Professional Elective - 1 (PE1)", "Professional Elective - 2 (PE2)", "Professional Elective - 3 (PE3)", "Professional Elective - 4 (PE4)", "Professional Elective - 5 (PE5)", "Flexi Core (FXC)", "Project Courses (PR)"]);

  const fullReport = {};
  const studentsReport = {};

  for (const student in students) {
    const totalCreds = {};
    const count = {};
    const results = students[student];

    for (const category of categories) {
      totalCreds[category] = 0;
      count[category] = 0;
    }

    for (const result of results) {
      const code = result[0];
      const creds = parseFloat(result[1]);
      if (!(code in courseCategory)) {
        continue;
      }
      const cat = courseCategory[code];
      if (!(cat in count)) {
        count[cat] = 0;
        totalCreds[cat] = 0;
      }

      count[cat] += 1;
      totalCreds[cat] += creds;
    }

    const studentData = {};
    for (const c of categories) {
      studentData[c] = {
        "coursesDone": count[c] ? count[c] : 0,
        "coursesRequired": Math.max(a[c] - (count[c] ? count[c] : 0), 0),
        "creditsAcquired": totalCreds[c] ? totalCreds[c] : 0,
        "creditsRequired": Math.max(b[c] - (totalCreds[c] ? totalCreds[c] : 0), 0),
      };
    }

    let additionalCredits = 0;
    const row = [];

    for (const c of categories) {
      if (!(c in count)) {
        count[c] = 0;
        totalCreds[c] = 0;
      }

      if (!(c in a)) {
        a[c] = 0;
        b[c] = 0;
      }

      if (additionalCreditCategories.has(c)) {
        additionalCredits += (Math.max(totalCreds[c] - b[c], 0));
      }

      row.push(count[c]);
      row.push(Math.max(a[c] - count[c], 0));
      row.push(totalCreds[c]);
      row.push(Math.max(b[c] - totalCreds[c], 0));
    }
    row.push(additionalCredits);
    fullReport[student] = row;
    studentsReport[student] = studentData;
    if (studentFailHistory[student]) {
      studentsReport[student]["comment"] = "Cannot get Honors degree due to Fail (or) Detention history in one (or) more courses";
    } else {
      if (additionalCredits >= 20) {
        studentsReport[student]["comment"] = "Can get Honors degree if no F (or) DT grade is obtained in the future results";
      } else {
        studentsReport[student]["comment"] = `Can get Honors degree if obtained more than 20 additional credits. Additional Credits Due - ${20 - additionalCredits}`;
      }
    }
    studentsReport[student]["additionalCredits"] = additionalCredits;
    studentsReport[student]["honorsEligible"] = additionalCredits >= 20 && !studentFailHistory[student];
  }
  document.getElementById("printReport").addEventListener("click", printReport(studentRegNo, studentsReport, categories, courseCategory, course, studentInfo));
  prepareStudentsTable(studentRegNo, studentsReport, categories, courseCategory, course, studentInfo, studentResultStatus);
});
