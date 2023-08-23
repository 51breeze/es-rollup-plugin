package api.table;

struct table UserProfile{
  id?: int(11) auto_increment,
  account_id?: int(11),
  email?:varchar(32) not null default '',
  phone?:varchar(32) not null default '',
  first?:varchar(32) not null default '',
  last?:varchar(32) not null default '',
  nickname?:varchar(32) not null default '',
  gender?:int(3) not null default 1,
  birthday?:varchar(12) not null default '',
  region?:varchar(255) not null default '',
  picture?:varchar(255) not null default '',
  status?:int(6) not null default 1,
  create_at?:int(11),
  update_at?:int(11),
  PRIMARY KEY(id),
  UNIQUE KEY key(account_id)
}