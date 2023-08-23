package api.table;

struct table UserProduct{
  id: int(11) auto_increment,
  account_id: int(11),
  category:varchar(128) not null default '',
  series:varchar(128) not null default '',
  model:varchar(128) not null default '',
  sn:varchar(64) not null default '',
  platform:varchar(128) not null default '',
  config:text() not null default '',
  order_number:varchar(128) not null default '',
  transaction_time:int(11) not null default 0,
  extension_time:int(11) not null default 0,
  status:smallint(6) not null default 1,
  create_at:int(11),
  update_at:int(11),
  PRIMARY KEY(id),
  KEY key(account_id)
}