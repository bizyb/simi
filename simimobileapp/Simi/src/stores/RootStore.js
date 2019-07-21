import { 
    QuestionStore,
    ChatRoomStore,
    ChatTopBarStore,
    ChatMessageListStore,
    QuestionDeckStore,
    InboxStore,
    KnowledgeBaseStore,
    SessionStore
 } from "./Stores";

export default class RootStore {
    questionStore
    chatRoomStore
    chatTopBarStore
    chatMessageListStore
    questionDeckStore
    inboxStore
    knowledgeBaseStore
    sessionStore

    constructor() {
      this.questionStore        = new QuestionStore(this)
      this.chatRoomStore        = new ChatRoomStore(this)
      this.chatTopBarStore      = new ChatTopBarStore(this)
      this.chatMessageListStore = new ChatMessageListStore(this)
      this.questionDeckStore    = new QuestionDeckStore(this)
      this.inboxStore           = new InboxStore(this)
      this.knowledgeBaseStore   = new KnowledgeBaseStore(this)
      this.sessionStore         = new SessionStore(this)
    }
}


