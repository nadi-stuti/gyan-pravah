# Gyan Pravah Quiz - Strapi Population Guide

This package contains 15 markdown files with quiz questions for MVP subtopics and a Node.js script to populate your local Strapi instance.

## 📁 Files Included

### Markdown Question Files (11+ created):
1. `ganga-questions.md` - Ganga River (30 questions)
2. `yamuna-questions.md` - Yamuna River (30 questions)
3. `krishna-river.md` - Krishna River (30 questions)
4. `ramayana-questions.md` - Ramayana Epic (30 questions)
5. `mahabharata.md` - Mahabharata Epic (30 questions)
6. `bhagavad-gita.md` - Bhagavad Gita (30 questions)
7. `hanuman-chalisa.md` - Hanuman Chalisa (30 questions)
8. `vishnu-sahasranama.md` - Vishnu Sahasranama (30 questions)
9. `diwali-questions.md` - Diwali Festival (30 questions)
10. `shiva-questions.md` - Lord Shiva (30 questions)
11. `durga-questions.md` - Goddess Durga (30 questions)

### Files to Create (4 remaining):
12. `vrindavan.md` - Vrindavan Dham
13. `badrinath.md` - Badrinath Dham  
14. `tulsi-das.md` - Sant Tulsi Das
15. `bhagavata-purana.md` - Bhagavata Purana

## 🚀 Quick Start

### Prerequisites
```bash
# Install required npm packages
npm install axios
```

### Step 1: Set up Environment
```bash
# Set your Strapi API token (if using authentication)
export STRAPI_API_TOKEN="your-api-token-here"
```

### Step 2: Configure Strapi Content Types

Create these content types in your Strapi admin panel:

#### Content Type: `topic`
- `name` (Text, required)
- `slug` (UID, required)
- `description` (Text)
- `order` (Number)
- `subtopics` (Relation: has many subtopics)

#### Content Type: `subtopic`
- `name` (Text, required)
- `slug` (UID, required)
- `isMVP` (Boolean, default: false)
- `topic` (Relation: belongs to topic)
- `questions` (Relation: has many questions)

#### Content Type: `question`
- `questionNumber` (Number, required)
- `questionText` (Text, required)
- `optionA` (Text, required)
- `optionB` (Text, required)
- `optionC` (Text, required)
- `optionD` (Text, required)
- `correctAnswer` (Enumeration: A, B, C, D, required)
- `difficulty` (Enumeration: Easy, Medium, Hard, required)
- `explanation` (Text)
- `subtopic` (Relation: belongs to subtopic)

### Step 3: Run the Population Script
```bash
# Make sure all markdown files are in the same directory as the script
node populate-strapi.js
```

## 📝 Creating Remaining Markdown Files

### Template for Remaining Files

Each file should follow this format:

```markdown
# [Subtopic Name] - Quiz Questions

**Category:** [Category Name]  
**Total Questions:** 30  
**Difficulty Distribution:** 12 Easy, 12 Medium, 6 Hard

---

## Easy Questions (1-12)

### Question 1
**Q:** [Question text]?  
**A)** [Option A]  
**B)** [Option B]  
**C)** [Option C]  
**D)** [Option D]  
**Correct Answer:** [A/B/C/D]  
**Difficulty:** Easy  
**Explanation:** [Explanation text]

[Repeat for questions 2-12]

---

## Medium Questions (13-24)

### Question 13
**Q:** [Question text]?  
**A)** [Option A]  
**B)** [Option B]  
**C)** [Option C]  
**D)** [Option D]  
**Correct Answer:** [A/B/C/D]  
**Difficulty:** Medium  
**Explanation:** [Explanation text]

[Repeat for questions 14-24]

---

## Hard Questions (25-30)

### Question 25
**Q:** [Question text]?  
**A)** [Option A]  
**B)** [Option B]  
**C)** [Option C]  
**D)** [Option D]  
**Correct Answer:** [A/B/C/D]  
**Difficulty:** Hard  
**Explanation:** [Explanation text]

[Repeat for questions 26-30]
```

### Sample Questions for Remaining Topics

#### Vrindavan (Dham category):
- Q: Vrindavan is associated with which deity? (Krishna)
- Q: Vrindavan is located in which state? (Uttar Pradesh)
- Q: Which festival is celebrated in Vrindavan? (Janmashtami, Holi)
- Q: Famous temple in Vrindavan? (Banke Bihari)

#### Badrinath (Dham category):
[Already created - see badrinath-questions.md reference in original file]

#### Tulsi Das (Sant category):
- Q: Who wrote Ramcharitmanas? (Tulsi Das)
- Q: In which language did Tulsi Das write? (Awadhi)
- Q: Tulsi Das lived in which century? (16th century)
- Q: Tulsi Das's birthplace? (Rajapur, UP)

#### Bhagavata Purana (Purana category):
[Questions already present in original file]

## 🔧 Script Configuration

Edit `CONFIG` object in `populate-strapi.js`:

```javascript
const CONFIG = {
  strapiUrl: 'http://localhost:1337',  // Your Strapi URL
  apiToken: process.env.STRAPI_API_TOKEN || '',  // API token
  markdownFilesDir: './',  // Directory with markdown files
};
```

## 📊 Expected Output

After running the script, you should have:
- **9 Topics**: Nadi, Shruti, Smriti, Purana, Stuti, Bhagvan, Utsav, Dham, Sant
- **15 MVP Subtopics**: Listed in the script
- **450 Questions total**: 30 questions × 15 subtopics

## 🐛 Troubleshooting

### Script fails to connect to Strapi
- Ensure Strapi is running on localhost:1337
- Check if API token is set correctly
- Verify network connection

### Questions not parsing correctly
- Check markdown file formatting matches the template exactly
- Ensure all required fields are present
- Verify no special characters breaking the regex

### Duplicate entries
- The script checks for existing topics/subtopics
- It will skip creation if they already exist
- Questions are always created (no duplicate check)

## 🎯 Next Steps

After population:
1. Verify data in Strapi admin panel
2. Test API endpoints for topics, subtopics, and questions
3. Integrate with your Next.js PWA frontend
4. Set up proper API permissions in Strapi
5. Configure production Strapi Cloud instance

## 📚 Data Structure

```
Topics (9)
├── Nadi
│   ├── Ganga (30 questions)
│   ├── Yamuna (30 questions)
│   └── Krishna River (30 questions)
├── Smriti
│   ├── Ramayana (30 questions)
│   ├── Mahabharata (30 questions)
│   └── Bhagavad Gita (30 questions)
├── Stuti
│   ├── Hanuman Chalisa (30 questions)
│   └── Vishnu Sahasranama (30 questions)
├── Utsav
│   └── Diwali (30 questions)
├── Bhagvan
│   ├── Shiva (30 questions)
│   └── Durga (30 questions)
├── Dham
│   ├── Vrindavan (30 questions)
│   └── Badrinath (30 questions)
├── Sant
│   └── Tulsi Das (30 questions)
└── Purana
    └── Bhagavata Purana (30 questions)
```

## 💡 Tips

1. **Backup your Strapi database** before running the script
2. **Test with one file** first to ensure proper configuration
3. **Create remaining markdown files** based on the provided template
4. **Review questions** for accuracy and cultural sensitivity
5. **Use environment variables** for sensitive configuration

## 🔗 API Endpoints (after population)

```
GET /api/topics - Get all topics
GET /api/topics/:id - Get specific topic with subtopics
GET /api/subtopics - Get all subtopics  
GET /api/subtopics/:id?populate=questions - Get subtopic with questions
GET /api/questions - Get all questions
```

## ✅ Checklist

- [ ] Install Node.js and npm packages
- [ ] Create Strapi content types (topic, subtopic, question)
- [ ] Set Strapi API token (if needed)
- [ ] Place all markdown files in correct directory
- [ ] Create remaining 4 markdown files
- [ ] Run populate-strapi.js script
- [ ] Verify data in Strapi admin
- [ ] Test API endpoints
- [ ] Configure permissions in Strapi
- [ ] Deploy to production

## 📞 Support

For issues related to:
- **Strapi configuration**: Check Strapi documentation
- **Content creation**: Refer to the template above
- **Script errors**: Review console output for specific errors

---

**Total Questions**: 450 (15 subtopics × 30 questions)  
**Total MVP Topics**: 9  
**Total MVP Subtopics**: 15

Good luck with your Gyan Pravah quiz app! 🙏