export enum ReservationIconName {
  created = 'assignment',
  approved = 'done',
  send = 'sms',
  started = 'play_arrow',
  completed = 'done_all',
  cancelled = 'clear',
  edit = 'edit_calendar',
  book = 'book_online',
  paid = 'price_check',
  partiallyPaid = 'request_quote',
  payment = 'payment',
  partiallyCompleted = 'rule',
  more = 'read_more',
  change = 'switch_account'
}

export enum RoomIconName {
  calendarToday = 'calendar_today',
  eventAvailable = 'event_available',
  eventBusy = 'event_busy'
}

export enum RoleIconName {
  roleCustomer = 'person',
  roleProfessional = 'group',
  roleManager = 'supervisor_account',
  roleAdmin = 'manage_accounts'
}

export type ReservationIconKey = keyof typeof ReservationIconName;
export type RoleIconKey = keyof typeof RoleIconName;
