import 'package:equatable/equatable.dart';

enum ChatSenderType { user, ai }

class ChatMessage extends Equatable {
  final String id;
  final ChatSenderType sender;
  final String text;
  final DateTime timestamp;
  final bool isVoice;

  const ChatMessage({
    required this.id,
    required this.sender,
    required this.text,
    required this.timestamp,
    this.isVoice = false,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] ?? '',
      sender: (json['sender'] == 'ai' || json['sender_type'] == 'AI')
          ? ChatSenderType.ai
          : ChatSenderType.user,
      text: json['text'] ?? json['content'] ?? '',
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp']) ?? DateTime.now()
          : DateTime.now(),
      isVoice: json['isVoice'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'sender': sender == ChatSenderType.ai ? 'ai' : 'user',
        'text': text,
        'timestamp': timestamp.toIso8601String(),
        'isVoice': isVoice,
      };

  @override
  List<Object?> get props => [id, sender, text, timestamp, isVoice];
}

class PromptSuggestion {
  final String title;
  final String prompt;
  final String icon;

  const PromptSuggestion({
    required this.title,
    required this.prompt,
    required this.icon,
  });
}
