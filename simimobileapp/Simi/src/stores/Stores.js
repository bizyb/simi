import {observable, computed} from 'mobx';

export class QuestionStore {
    @observable question            = ""
    @observable questionId          = ""
    @observable usersOnline         = 0
    @observable formattedUserCount  = ""
    @observable value               = ""
    @observable showLogoutDialog    = false

    constructor(rootStore) {
        this.rootStore = rootStore
    }
    
}

export class ChatRoomStore {
    @observable showConnectionDialog    = true
    @observable connected               = false
    @observable userDisconnected        = false
    @observable editable                = false
    @observable placeholder             = ""
    @observable message                 = ""
    @observable isTyping                = false
    @observable showControls            = false
    @observable data                    = []
    @observable keys                    = {}
    @observable buttonText              = ""
    @observable buttonTextColor         = "tomato"
    @observable partnerOnline           = false
    @observable onSubmit                = null 


    constructor(rootStore) {
        this.rootStore = rootStore
    }
}

export class ChatTopBarStore {
    @observable showEndChatDialog   = false
    @observable showFeedbackDialog  = false
    @observable showNextSMEDialog   = false
    @observable starCount           = 0
    @observable feedbackCallback    = null 
    
    constructor(rootStore) {
        this.rootStore = rootStore
    }
}

export class ChatMessageListStore {
    @observable data                    = []
    @observable id                      = ""
    @observable cache                   = {}
    @observable showEncryptionDialog    = false

    constructor(rootStore) {
        this.rootStore = rootStore
    }
}

export class QuestionDeckStore {
    @observable currentIndex            = 0
    @observable questions               = []
    @observable isRefreshing            = false
    @observable showSwipeInstructions   = true
    @observable refreshIconColor        = "tomato"

    constructor(rootStore) {
        this.rootStore = rootStore
    }
}

export class InboxStore {
    @observable data                = []
    @observable longPressEnabled    = false
    @observable selectedItems       = []
    @observable showDeleteBtn       = false
    @observable showDeleteDialog    = false
    
    constructor(rootStore) {
        this.rootStore = rootStore
    }

    @computed get unreadCount() {
        return this.data.filter((item) => {return !item.isRead}).length
    }
}

export class KnowledgeBaseStore {
    @observable btnIcon         = null
    @observable inputText       = ""
    @observable tickedBoxes     = {}
    @observable textInputRef    = ""
    @observable data            = []

    constructor(rootStore) {
        this.rootStore = rootStore
    }

    set tickedBoxes(index) {
        this.tickedBoxes[index] = true
    }
}

export class SessionStore {
    @observable events              = {}
    @observable endpoints           = {}
    @observable isNewUser           = true
    @observable asyncHasReturned    = false
    @observable isPopulated         = false
    @observable jwtToken            = ""
    @observable socket              = null 
    @observable userId              = null
    @observable firstName           = null
    @observable isSme               = false 
    @observable isOp                = false
    @observable downloadComplete    = false
    @observable downloadError       = false
    @observable chatPartner         = {}
}
