interface UserState {
  nextQuestionId: number;
  isAttendHolmat: boolean;
  nRSVPHolMat: number;
  isAttendWedcer: boolean;
  nRSVPWedCer: number;
  wedCerNames: string[];
}

class UserMessage {
  private state: UserState;

  constructor() {
    this.state = {
      nextQuestionId: 0,
      isAttendHolmat: false,
      nRSVPHolMat: 0,
      isAttendWedcer: false,
      nRSVPWedCer: 0,
      wedCerNames: [],
    };
  }

  public getNextQuestionId(): number {
    return this.state.nextQuestionId;
  }

  public setNextQuestionId(id: number): void {
    this.state.nextQuestionId = id;
  }

  public getIsAttendHolmat(): boolean {
    return this.state.isAttendHolmat;
  }

  public setIsAttendHolmat(isAttend: boolean): void {
    this.state.isAttendHolmat = isAttend;
  }

  public getNRsvpHolmat(): number {
    return this.state.nRSVPHolMat;
  }

  public setNRsvpHolmat(n_rsvp_holmat: number): void {
    this.state.nRSVPHolMat = n_rsvp_holmat;
  }

  public getIsAttendWedcer(): boolean {
    return this.state.isAttendWedcer;
  }

  public setIsAttendWedcer(isAttend: boolean): void {
    this.state.isAttendWedcer = isAttend;
  }

  public getNRsvpWedcer(): number {
    return this.state.nRSVPWedCer;
  }

  public setNRsvpWedcer(n_rsvp_wedcer: number): void {
    this.state.nRSVPWedCer = n_rsvp_wedcer;
  }

  public getWedcerNames(): string[] {
    return this.state.wedCerNames;
  }

  public setWedcerNames(wedcer_names: string[]): void {
    this.state.wedCerNames = wedcer_names;
  }

  public reset(): void {
    this.state = {
      nextQuestionId: 0,
      isAttendHolmat: false,
      nRSVPHolMat: 0,
      isAttendWedcer: false,
      nRSVPWedCer: 0,
      wedCerNames: [],
    };
  }

  public getState(): UserState {
    return this.state;
  }
}

export default UserMessage;
