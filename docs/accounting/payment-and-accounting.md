
# New Feature : Students, Attendance and Accounting  
For context, "Students" will be a feature that will link differents aspects of the webapp application (payment, attendance, grades, school year, etc ...).  

The accounting feature will manage differents aspects involving money for the school: payments, cash deposit (when payment made in cash), expenses, margins and whatever you would advice. 

# 1. Students
When opened, this will allows differents things: (a panel will open on the left side with options) - I need you help to make a great ux design for this page (best customer experience expected)
## 1.1 List of Students 
To visualizes list of students enrolled and active for this school year. We can filter students by grade, firstname, lastname, date of birth and categories (late for payment, frequently absent for attendance, etc ...)

Possible actions with Visualizing a student: 
    - view and update personal information
    - Balance status (progress of the payment towards what's owed for the school year with a progress bar maybe, and the status displayed could be Late, on time, in advance and complete which earn a gold medal) and Payment history (for the active school year, later will implement the possible or accessing proevious school year). From here, we could make a payment.
    - Student attendance data and relevant charts, I wll let you recommend me few options. We can also update the attendance for a student from here.   


Could you make sure that the database data sample is updated to help us visualize all these above.

## 1.2 List of Grades
The grades can be accessed to see the students in that grade for that year, we can add (or collect) or update student attendance.

A grade has a student grade leader ("responsable de classe" in french), which is an information that can be visible and edited.

The grade also has a list of classes ("liste de matières" in french) associated to it. This list can be viewed and edited. Each class should have a title  an description, the first & last name of the teacher for that school year.

Thanks you rovodev, I have the list of classes per grade described in this file here : docs\grade-class-data\guinea-curriculum-structure.md. Can you make sure that the database has it as sample data for us to use when testing. Make sure to add sample data for the list of teachers, teaching class for the school year (we will build a feature for staffing, which will include the teachers adding, edit, enable, disabling teachers later).  

In a grade, we should be able to see few charts like the student grade attendance ratio or the student grade payment status ratio. 

## 1.3 Attendance
Per grade and per day, we should be able to track the student attendance to the school. This is usually done every morning around 9am. We need a cool feature to make it easy to do this for each class and each student to keep track of their attendance per grade, per day in a school year. Later we will be able to create alerts, warnings and congratulate some students thanks to it. I will let you suggest me the best way to design and approach this (should be made very easy through phone too). 

Make sure the database has attence for all the existing enrolled students from September 15th now. For the attendance you can have 10% randomly assigned missing attendance per grade. Keep in mind, the school is only for :
- Elementary grades: from monday till friday
- College grades: from monday till friday
- High School grades: from monday till Saturday

# 2. Accounting 
Include feature: Balance, payment, expenses 

## 2.1 Balance 
The balance feature helps keep track of payments and expenses with the margins. Design and create a great page presenting this with your suggestions. 
For payments, there are 2 forms of payments (cash and orange money): 
- orange money is instantenuous, so along as the payment is confirmed, it should be total money available
- cash is different, when cash payment is made, a user with permissions will need to confirm that cash has been deposited at the bank (will be described below) before we consider it part of the total amount available.

Both payments and expenses should have status flow, you can make you suggestions.

## 2.2 Payments
The payment is a feature that is already partial managed through enrollement by being able to confirm the amount that the student will owe for the entire shool year and the first payment if the person enrolling the student is about to it. 

What do the next for payment : 
    1. Add a payment for a specific student, this should show the current payment progress for that student with the payment history, and same as in enrollement, the new payment is distributed to the months with the same approach. 
        - When a payment made in cash, the status becomes "Pending Deposit" (this requires the cash to be deposited at the bank).
        - When a payment made is made with Orange money, the status becomes "Pending Review" for 24h, after which if not rejected, it will move to "Confirmed" or "Completed" 
    2. Update payment should allow to update existing payment that's not confirmed or completed
    3. Update cash deposit (only for payment with cash) -  to update that the cash has been deposited at the bank, which required the date of deposited, the bank transaction reference, name of the person who did the deposit (user should be able to select "Me"). 
    4. Final Review payment: When cash deposited for a payment or the payment is made with orange money, the payment will be reviewed to reject (will be returned to for updates with comments from the person who reviewed) or approve it (to move it to confirmed or completed). 


# 2.3 Expenses
To be define later, but you can make suggestions, the expenses should only be in cash for now (but we can leave the option to choose Orange money). there will be no cash withdrawal tracking. But the expense will be subject to different statuses and review before being confirmed.

Please make the sure the database has the required sample data for me to perform testing. 

# NOTES: 
- Don't forget to use the translation mechanism
- When creating or update french translation, make sure to only capitalize the first word
- Make sure the database has the data needed to support testing this 
- The database table structure should evolve to havcez a person table with role relations with students, teachers, users. In the future we might have more use for it. 
- Make sure to use great ux design approaches
- If possible, enable the dark mode view (right now, only like mode by default)  

Any questions ? 