create table new_student
(
id int NOT NULL auto_increment,
email varchar(100),
has_experience varchar(3),
course varchar(100),
conversation_id varchar(100),
time_frame varchar(100),
location varchar(100),
source varchar(20),
create_date  datetime,
primary key (id)
);