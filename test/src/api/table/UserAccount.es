package api.table;

struct table UserAccount{
  id: int(11) auto_increment,
  account: varchar(16),
  password: varchar(32),
  status:int(6),
  create_at:int(11),
  update_at:int(11),
  PRIMARY KEY(id)
}