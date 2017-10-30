create table features
(
id int NOT NULL auto_increment,
feature_name varchar(100),
description varchar(1000),
links varchar(100),
languageid int,
language_name varchar(100),
primary key (id)
);