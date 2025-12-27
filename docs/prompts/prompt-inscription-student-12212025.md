# Product Context 
As you know we are building an weba application with offline capability for a school in guinea (with unreliable network), to manage the school. This goes from student enrollement to accounting, managing staff, grades, classes. 

# Feature focused for this prompt: Student Enrollement for school year 
As you know every school year will start around September and ends towards June of next year. And today we are going to build a feature that will enable enrollement of a student for: 
- new: which veryu likely means that the school year hasn't started yet but is about to .
- current school year : which the school has probably already started 

(School year is designed by "2025 - 2026" for the year starting in mid September 2025 and ending mid June 2026, ... "2026 - 2027" from Sep 2026 to June 2027 and so on...). 
A student who is being enrolled can be : 
- an new student: a new comer to the school, and so we will need to collect his informations while he is getting enrollement. 
- an existing student : Which mean, he was already in the school the past year and so most of his information are available 

The enrollement is performed by an employee of the school, most likely: the accountant, the assistant or the director (but for now we will not worry about the roles, it will be managed later) - The only role we should assign to them "employee" for now. 

For more context, the enrollement usally done with the student and at least parent student who will provide the information required, sign any required document and pay (if expected).

### Enrollement process (flow) : 
When the click the button to make an enrollment, a form will open with multiple step flow: 

#### Step 1 - Grade selection : 
The first step will show tosday's date, the school year for which we are enrolling the student. The user will select if the studient is going to elementary, college or high school. Then he or she will select the grade which the student is being enrolled in. Upon selectionn the current number of people enrolled (approved) to the grade and the yearly amount owed for the entire school year will be shown just as info. 
Both selection are mandatory in this page, the next user can click next
#### Step 2 - Student information: 
In the student, we are going to retrieve, update or save the student informations:
- Personal Information 
    - Firtname (mandatory)
    - Lastname (mandatory)
    - Gender (mandatory)
    - Date of Birthday (mandatory)
    - Phone (mandatory)
    - Email
    - Picture
    - Birth certificate copy (image or pdf)
- Affiation or parents informations: 
    - Father Firstname & Last name (mandatory)
    - Mother Firstname & lastname (mandatory)
    - Adress
    - Father email & phone 
    - Mother email & phone

- Additional informations
    - Add note (title & details) - should be able to add one or more

When enrolling new student, the page will allow the user to fill out these information. 
When enrolling in a returning student, we should be able to find him with his student number, last name, first name, date of birthday and last grade. Once found, all the informations should be visible. The user should be able to edit the information and save before proceeding the next page. 
Once done, the user save and continue ... (At this point after, saving this step, there is a chance the user stop here, the app will have give to possibility to retrieve a started enrollement within 10 days of creation).

#### Step 3 - Payment breakdown:
At this step, the user will see the payment owed the entire school year, for that grade, he or she should also see the Schedule payment breakdown with associated months (there are no inscription fees for now):

For school year "2025 - 2026", if the total year owed is 900000 GNF, he or she should see: 
- Schedule 1 breakdown: 
    - September 2025: 100000 GNF (For this would mid september to mid october, same approach from the ones below)
    - October  2025: 100000 GNF
    - Mai 2026: 100000 GNF (yes it can seem odd but the first 3 months to pay are first 2 months and last months of the school year)
- Schedule 2 breakdown:
    - November 2025: 100000 GNF
    - December  2025: 100000 GNF
    - January  2026: 100000 GNF
- Schedule 3 breakdown:
    - Fevrier 2026: 100000 GNF
    - Mars 2026: 100000 GNF
    - Avril 2026: 100000 GNF

At this point the user, can choose to change (lower only) the total amount owed for the school year (this can happen when some parents are not able to pay the entire amount, but it's an exception and that enrollement will require approval after finalized from a different user before being approved).

If the yearly amount is change, the payment breakdown should be updated to inform the person what he will have to pay. So the enrollement table should a field reserve to store the amount that the student will have to pay for the enire school year.

When done the user can click on save and continue

#### Step 4 - Payment Transaction:
At this point, it's time to pay. The payment can be in two ways: cash or Orange Money. This step can be skipped if the student or parent is not ready to pay yet (we will have an accounting feature that will track payment and what's owed or past due and all)

The user should be able to enter to amount paid by the student or parent. The app will automatically shows what Schedule(s) and months that covers (for example - based on the amount above, if the student parent pays 200000 GNF, the app will show that - Schedule 1 if payed by 66% and the months of September and October will show green with 100%).
A field "Enrollemnt fees" can be shown but with 0 GNF and we should not be able to modify it for now. 

If the payment made by cash: 
- The user should add receipt number and a picture or copy (image or pdf) of the receipt given to the person who paid (receipt number is mandatory)

If the payment made via Orange Money: 
- The user should add tyhe orange money transaction id and a picture or copy (image or pdf) of the receipt given to the person who paid (receipt number is mandatory)

The payment is stored with today's date of course. 

if the user skip the step or save the payment information, he can move to the next step (review)

#### Step 5 - Review : 
It's time for the user to review the information he or she has entered to make sure that everything is in order before finalizing the enrollement. 
At this point, if needed, he should be able to update a section and come back to this step.

Once the user is ready he can submit the enrollement, which save the data. 

#### Step 6 - Cohnfirmation:

And the enrollement is a status submitted (unless the user has changed the school year total amount owed, in which case, the status is moved "review required" by another user).

PDF Document is generated with the school letter head generated (you can used logo in it) with the details of the school and the enrollement. This document will be printed and stamped by the school (they will keep a copy and give a copy to the student or parent)

### Once enrollement is submitted 
- enrollement "submitted" - this is can be reviewed by another user and approved, returned (for changes) or rejected. But after 3 days, the enrollement is automatically approved.
- enrollement "review required" - this enrollement needs an aproval from another user before being approved. (keep)

Notes:
- The school includes: elementary, college and high school :
    - Elementary school include: Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6 (In french: 1ere Année, 2eme Année, 3eme Année, 4eme Année, 5eme Année, 6eme Année)
    - College include: Grade 7, Grade 8, Grade 9, Grade 10 (In french: 7eme Année, 8eme Année, 9eme Année, 10eme Année)
    - Elementary school include: Grade 11, Grade 12, Grade Terminal (In french: 11eme Année, 12eme Année, Terminal)
    - Usually the high the grade, the more expensive
- Each grade will have a specific total amount to be paid before the end of the year. This amount can change every year (there will be section in the school adminstration page to manage this before enrollement starts) 
- A school year enrollement is opened (or active) next month after the end the last school year and ends at the same day as the school end date. So if the school year for "2024 - 2025" started September 15th 2024 and ended June 15th 2025, then enrollement of the next school year "2025 - 2026" would be active from July 1st 2025 to June 15 2026. Later, there will be an administration page that will manage the school year (start date, end date, enrollement start date, enrollement end date)  
- "Add note" is supposed to help add information like medical or hobby or something else
- In the parent information, at least one of the phone number should be provided
- The student number is a unique number assigned by the app to the student when he or she has been enrolled for the first time. It will help us link the student to his school years, payment history, and other required information.  

# Recommandations: 
- Make sure to document the implementation plan, the user guide for this feature and anything that can help the next chat sessions
- Make sure to understand the logic clearly to define an excellent database schema to enable this
- Make sure to have sample data in the database to test this feature
- Do not forget that we need to be able to support lower bandwith data or offline mode
- School Management database data be very large, so don't forget to consider indexes or any mechanisms to help make the api calls faster.

Any questions to clarity ? 