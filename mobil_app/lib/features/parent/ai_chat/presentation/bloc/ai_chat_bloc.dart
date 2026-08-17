import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uuid/uuid.dart';
import 'package:yordamchi_med/features/parent/ai_chat/data/repositories/ai_chat_repository.dart';
import 'package:yordamchi_med/features/parent/ai_chat/domain/models/ai_chat_models.dart';

// Events
abstract class AiChatEvent extends Equatable {
  const AiChatEvent();

  @override
  List<Object?> get props => [];
}

class InitChatEvent extends AiChatEvent {}

class SendUserMessageEvent extends AiChatEvent {
  final String text;
  final bool isVoice;

  const SendUserMessageEvent(this.text, {this.isVoice = false});

  @override
  List<Object?> get props => [text, isVoice];
}

class ClearChatEvent extends AiChatEvent {}

// States
abstract class AiChatState extends Equatable {
  const AiChatState();

  @override
  List<Object?> get props => [];
}

class AiChatLoading extends AiChatState {}

class AiChatLoaded extends AiChatState {
  final List<ChatMessage> messages;
  final List<PromptSuggestion> quickPrompts;
  final bool isTyping;

  const AiChatLoaded({
    required this.messages,
    required this.quickPrompts,
    this.isTyping = false,
  });

  AiChatLoaded copyWith({
    List<ChatMessage>? messages,
    List<PromptSuggestion>? quickPrompts,
    bool? isTyping,
  }) {
    return AiChatLoaded(
      messages: messages ?? this.messages,
      quickPrompts: quickPrompts ?? this.quickPrompts,
      isTyping: isTyping ?? this.isTyping,
    );
  }

  @override
  List<Object?> get props => [messages, quickPrompts, isTyping];
}

// BLoC
class AiChatBloc extends Bloc<AiChatEvent, AiChatState> {
  final AiChatRepository repository;
  final _uuid = const Uuid();

  AiChatBloc({required this.repository}) : super(AiChatLoading()) {
    on<InitChatEvent>(_onInit);
    on<SendUserMessageEvent>(_onSendMessage);
    on<ClearChatEvent>(_onClearChat);
  }

  void _onInit(InitChatEvent event, Emitter<AiChatState> emit) {
    final prompts = repository.getQuickPrompts();
    final initialGreeting = ChatMessage(
      id: _uuid.v4(),
      sender: ChatSenderType.ai,
      text:
          "Assalomu alaykum! Men \"Yordamchi Med\" maxsus ta'lim sun'iy intellekt maslahatchisiman. Farzandingizning psixo-emotsional holati, kun tartibi, sensorika yoki nutq mashg'ulotlari bo'yicha qanday savolingiz bor?",
      timestamp: DateTime.now(),
    );

    emit(AiChatLoaded(
      messages: [initialGreeting],
      quickPrompts: prompts,
    ));
  }

  Future<void> _onSendMessage(
    SendUserMessageEvent event,
    Emitter<AiChatState> emit,
  ) async {
    if (state is! AiChatLoaded) return;
    final curr = state as AiChatLoaded;

    final userMsg = ChatMessage(
      id: _uuid.v4(),
      sender: ChatSenderType.user,
      text: event.text,
      timestamp: DateTime.now(),
      isVoice: event.isVoice,
    );

    final updatedMessages = [...curr.messages, userMsg];
    emit(curr.copyWith(messages: updatedMessages, isTyping: true));

    try {
      final reply = await repository.sendMessage(prompt: event.text);
      final aiMsg = ChatMessage(
        id: _uuid.v4(),
        sender: ChatSenderType.ai,
        text: reply,
        timestamp: DateTime.now(),
      );

      emit(curr.copyWith(
        messages: [...updatedMessages, aiMsg],
        isTyping: false,
      ));
    } catch (e) {
      final errorMsg = ChatMessage(
        id: _uuid.v4(),
        sender: ChatSenderType.ai,
        text: "Kechirasiz, xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        timestamp: DateTime.now(),
      );
      emit(curr.copyWith(
        messages: [...updatedMessages, errorMsg],
        isTyping: false,
      ));
    }
  }

  void _onClearChat(ClearChatEvent event, Emitter<AiChatState> emit) {
    add(InitChatEvent());
  }
}
