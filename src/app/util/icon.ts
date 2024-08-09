export enum ReservationIconName {
  created = 'assignment',
  approved = 'done',
  send = 'sms',
  coffee = 'coffee',
  started = 'play_arrow',
  completed = 'done_all',
  cancelled = 'clear',
  freeCancellation = 'free_cancellation',
  edit = 'edit_calendar',
  book = 'book_online',
  paid = 'price_check',
  partiallyPaid = 'request_quote',
  payment = 'payment',
  notify = 'published_with_changes',
  partiallyCompleted = 'rule',
  more = 'read_more',
  change = 'switch_account',
  cancelledPaymentRequired = 'credit_card_off',
  editCancelled = 'edit_calendar',
  color = 'palette',
  previous = 'line_start_arrow_notch',
  next = 'line_end_arrow_notch',
  clone = 'file_copy'
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
