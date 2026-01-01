# Context
I spoke to the product owner and he gave us some new information, he would like for us to work on Administration of the academic part of the school and the grades. 


## Administration
This includes a list of feature will manage data and elements currently stored in the database through scripts. 

### 0 User Access: 
The direction should be able to invite user (through their email) to login to the app. They should received an email with a temporary 

### 1. School year
The user should be able to create, edit or view a school year. This is critical aspect because most of the informations are linked to the school year. A school year can be "new", "active" or "passed". 
The user should not be able to create more than the next school year. Currently "2025 - 2026" should be active, so he can create "2026 - 2027" but "2027 - 2028" (and he can not create a school year in the past). School year should have starting and ending date. After creating the school year, the user be able to configure it now or later. What should be configured: 
- Grades: Are will keeping the same grades (are there more or less)
- Staff: Are we still keeping the same staff ? (Directior, Assistant, Accountants, Censor, Teachers)
- Activities: Are we keeping the same activities this school year, are there more or less or different ? 

### 2. Grades 
Per school year (active or new - if there is no new school year, it should be for the active one per default), there is gonna be a number of grades where students can enroll. 
We should be able to view, Add, update, enable/disabled a grade or delete (action limited to few roles). 
For each grade, there can be more than one room. So the direction should be able to define how many and there names. For example, in 7th grade, the school can have rooms: 7A, 7B, 7C. 
The grade rooms are important because after a student has been enrolled by the accountants and the enrollement has been approved. The student should be active and he should assigned to a Grade Room. Grade Rooms (7A, 7B, 7C) should have the same classes (in french "matières"). 
Now there is an exception to the last sentence and I'm not sure how to approach it so I will need your advice. In the high school grades for e.g, "Terminal", there can be Terminal Maths Sciences ("Terminale Sciences Mathémathiques" in French), Terminal Litterature Sciences ("Terminale Sciences Sociales" in French) and , Terminal Experimental Sciences ("Terminale Sciences experimentales" in French) which all have their own classes (or "matieres" in french); each of 3 grades in high school have the 3 options (which can be considered as a sub-grade). So there can be 2 rooms of 11 Maths Sciences: 11A SM and 11B SM ("SM" is "Sciences Mathématiques" in french). I was thinking about changing the high school grades breakdown to have 9 of them : 11 SS, 11 SM, 11 SE, 12 SS, 12 SM, 12 SE, Terminal SS, Terminal SM, Terminal SE. What do you say ?  

From this UI, we should be able to manage the classes assigned or unassigned to a grade.

# Teachers and Classes
This feature should enabled define, list, managed the classes with their assigned teachers for the school year (active or new - if there is no new school year, it should be for the active one per default). 

# NOTES:
- What are you are not sure about something, ask me (while suggesting some options)
- Make sure the required api, database updated and changes are made (do not lose my existing data) but make sure to update the sample if required

ANY QUESTIONS ? 