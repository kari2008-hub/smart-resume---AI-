// SmartResume AI - Resume Analysis Demo

const jobSkills = {
    "java developer": [
        "java", "oops", "sql", "jdbc", "spring boot",
        "git", "rest api", "data structures"
    ],
    "web developer": [
        "html", "css", "javascript", "react",
        "responsive design", "git", "rest api"
    ],
    "python developer": [
        "python", "sql", "pandas", "numpy",
        "flask", "git", "data structures"
    ],
    "data analyst": [
        "python", "sql", "excel", "power bi",
        "tableau", "pandas", "statistics"
    ],
    "software developer": [
        "java", "python", "oops", "sql",
        "data structures", "algorithms", "git"
    ]
};

const resumeInput = document.getElementById("resume");
const jobRoleInput = document.getElementById("jobRole");
const jobDescriptionInput = document.getElementById("jobDescription");
const analyzeButton = document.getElementById("analyzeBtn");
const resultsSection = document.getElementById("results");

let resumeText = "";

// Read the selected TXT resume
if (resumeInput) {
    resumeInput.addEventListener("change", function () {
        const file = this.files[0];

        if (!file) {
            resumeText = "";
            return;
        }

        const isText = file.name.toLowerCase().endsWith(".txt");

        if (!isText) {
            alert("Bhai, abhi demo mein sirf TXT resume upload kar sakte hain.");
            this.value = "";
            resumeText = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("File 5 MB se chhoti honi chahiye.");
            this.value = "";
            resumeText = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            resumeText = event.target.result || "";
            alert("Resume uploaded successfully!");
        };

        reader.onerror = function () {
            alert("File read nahi ho paayi. Dobara try karo.");
        };

        reader.readAsText(file);
    });
}

// Connect the Analyze button
if (analyzeButton) {
    analyzeButton.addEventListener("click", analyzeResume);
} else {
    console.error("Analyze button nahi mila. HTML mein id='analyzeBtn' check karo.");
}

async function analyzeResume() {
    const selectedRole = (jobRoleInput?.value || "").trim().toLowerCase();
    const description = (jobDescriptionInput?.value || "").trim(); 
    if (!resumeInput || !resumeInput.files || !resumeInput.files[0]) {
        alert("Pehle apna TXT resume upload karo.");
        return;
    }

    if (!resumeText.trim()) {
        alert("Resume abhi read ho raha hai ya khaali hai. Dobara TXT file select karo.");
        return;
    }

    if (!selectedRole) {
        alert("Pehle Target Job Role select karo.");
        return;
    }

    if (!description) {
        alert("Pehle Job Description box mein job details likho.");
        return;
    }

    const requiredSkills = jobSkills[selectedRole] || [];

    if (requiredSkills.length === 0) {
        alert("Is job role ke liye skills list nahi mili. Dropdown ka role check karo.");
        return;
    }

    const resumeLower = resumeText.toLowerCase();

    const matchedSkills = requiredSkills.filter(function (skill) {
        return resumeLower.includes(skill.toLowerCase());
    });

    const missingSkills = requiredSkills.filter(function (skill) {
        return !resumeLower.includes(skill.toLowerCase());
    });

    const score = Math.round(
        (matchedSkills.length / requiredSkills.length) * 100
    );

    displayResults(score, matchedSkills, missingSkills);

    if (resultsSection) {
        resultsSection.classList.remove("hidden");
        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

function displayResults(score, matchedSkills, missingSkills) {
    const scoreElement = document.getElementById("score");
    const matchedElement = document.getElementById("matchedSkills");
    const missingElement = document.getElementById("missingSkills");
    const suggestionsElement = document.getElementById("suggestions");

    if (!scoreElement || !matchedElement ||
        !missingElement || !suggestionsElement) {
        alert("Results section ke HTML IDs match nahi kar rahe. Mujhe index.html dikhana.");
        return;
    }

    scoreElement.textContent = score + "%";

    matchedElement.innerHTML = "";
    missingElement.innerHTML = "";
    suggestionsElement.innerHTML = "";

    if (matchedSkills.length === 0) {
        matchedElement.textContent = "Abhi koi matching skill nahi mili.";
    } else {
        matchedSkills.forEach(function (skill) {
            const tag = document.createElement("span");
            tag.className = "skill-tag";
            tag.textContent = skill;
            matchedElement.appendChild(tag);
        });
    }

    if (missingSkills.length === 0) {
        missingElement.textContent = "Saari listed skills match ho gayi!";
    } else {
        missingSkills.forEach(function (skill) {
            const tag = document.createElement("span");
            tag.className = "skill-tag missing";
            tag.textContent = skill;
            missingElement.appendChild(tag);
        });
    }

    const suggestions = [];

    if (missingSkills.length > 0) {
        suggestions.push(
            "Agar ye skills tumhare career goal ke liye relevant hain, toh inhe seekhne aur practice karne par dhyan do: " +
            missingSkills.join(", ") + "."
        );
    }

    if (matchedSkills.length > 0) {
        suggestions.push(
            "Resume mein projects ke examples do, jahan tumne ye skills use ki hain: " +
            matchedSkills.join(", ") + "."
        );
    }

    suggestions.push(
        "Resume ko readable rakho, clear headings use karo aur apni achievements honestly likho."
    );

    suggestions.forEach(function (message) {
        const item = document.createElement("li");
        item.textContent = message;
        suggestionsElement.appendChild(item);
    });

    const resultMessage = document.getElementById("resultMessage");

    if (resultMessage) {
        resultMessage.textContent =
            "Note: Ye demo keyword-match score hai, actual company ATS score nahi.";
    }
}
async function analyzeWithBackend(resumeText) {
    try {
        const response = await fetch("http://localhost:8080/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: resumeText
        });

        if (!response.ok) {
            throw new Error("Backend response error: " + response.status);
        }

        const result = await response.json();

        console.log("Java Backend Analysis:", result);

        return result;

    } catch (error) {
        console.error("Backend connection failed:", error);
        alert("Java backend connect nahi hua. Check karo ki server running hai.");
        return null;
    }
}