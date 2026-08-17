import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_strings.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/date_formatter.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/core/widgets/custom_app_bar.dart';
import 'package:yordamchi_med/features/parent/ai_chat/domain/models/ai_chat_models.dart';
import 'package:yordamchi_med/features/parent/ai_chat/presentation/bloc/ai_chat_bloc.dart';
import 'package:yordamchi_med/features/parent/ai_chat/presentation/widgets/typing_indicator.dart';
import 'package:yordamchi_med/features/parent/ai_chat/presentation/widgets/voice_recording_modal.dart';

class ParentAiChatScreen extends StatefulWidget {
  const ParentAiChatScreen({super.key});

  @override
  State<ParentAiChatScreen> createState() => _ParentAiChatScreenState();
}

class _ParentAiChatScreenState extends State<ParentAiChatScreen> {
  final _textController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    context.read<AiChatBloc>().add(InitChatEvent());
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage({String? customText, bool isVoice = false}) {
    final text = (customText ?? _textController.text).trim();
    if (text.isEmpty) return;

    HapticHelper.lightImpact();
    context.read<AiChatBloc>().add(SendUserMessageEvent(text, isVoice: isVoice));
    if (customText == null) {
      _textController.clear();
    }
    _scrollToBottom();
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 150), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _openVoiceModal() {
    HapticHelper.lightImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => VoiceRecordingModal(
        onRecorded: (recognizedText) {
          _sendMessage(customText: recognizedText, isVoice: true);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: CustomAppBar(
        title: AppStrings.aiChatTitle,
        subtitle: AppStrings.aiChatSubtitle,
        showBackButton: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, size: 22),
            onPressed: () {
              HapticHelper.lightImpact();
              context.read<AiChatBloc>().add(ClearChatEvent());
            },
          ),
        ],
      ),
      body: BlocConsumer<AiChatBloc, AiChatState>(
        listener: (context, state) {
          if (state is AiChatLoaded) {
            _scrollToBottom();
          }
        },
        builder: (context, state) {
          if (state is! AiChatLoaded) {
            return const Center(child: CircularProgressIndicator());
          }

          return Column(
            children: [
              // Chat Message List
              Expanded(
                child: ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  itemCount: state.messages.length + (state.isTyping ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == state.messages.length && state.isTyping) {
                      return const Align(
                        alignment: Alignment.centerLeft,
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 6),
                          child: TypingIndicator(),
                        ),
                      );
                    }

                    final msg = state.messages[index];
                    return _MessageBubble(message: msg);
                  },
                ),
              ),

              // Quick Prompt Chips
              if (state.messages.length <= 2) ...[
                Container(
                  height: 44,
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: state.quickPrompts.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final p = state.quickPrompts[index];
                      return ActionChip(
                        avatar: Text(p.icon, style: const TextStyle(fontSize: 14)),
                        label: Text(
                          p.title,
                          style: AppTypography.labelSmall.copyWith(
                            color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        backgroundColor:
                            isDark ? AppColors.cardDark : AppColors.softBlueCard,
                        side: BorderSide(
                          color: isDark ? AppColors.borderDark : AppColors.borderLight,
                        ),
                        onPressed: () {
                          _sendMessage(customText: p.prompt);
                        },
                      );
                    },
                  ),
                ),
              ],

              // Bottom Input Bar
              Container(
                padding: EdgeInsets.only(
                  left: 16,
                  right: 16,
                  top: 10,
                  bottom: MediaQuery.of(context).padding.bottom + 10,
                ),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.surfaceDark : Colors.white,
                  border: Border(
                    top: BorderSide(
                      color: isDark ? AppColors.borderDark : AppColors.borderLight,
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    // Voice Mic Button
                    IconButton(
                      icon: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.coral.withAlpha(20),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.mic_rounded,
                          color: AppColors.coral,
                          size: 22,
                        ),
                      ),
                      onPressed: _openVoiceModal,
                    ),
                    const SizedBox(width: 6),

                    // Text Field
                    Expanded(
                      child: TextField(
                        controller: _textController,
                        maxLines: 4,
                        minLines: 1,
                        textCapitalization: TextCapitalization.sentences,
                        style: AppTypography.bodyMedium.copyWith(
                          color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                        ),
                        decoration: InputDecoration(
                          hintText: AppStrings.aiChatPlaceholder,
                          contentPadding:
                              const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(24),
                            borderSide: BorderSide.none,
                          ),
                          filled: true,
                          fillColor:
                              isDark ? AppColors.cardDark : AppColors.softBlueCard,
                        ),
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                    const SizedBox(width: 8),

                    // Send Button
                    Container(
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(
                          Icons.send_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                        onPressed: () => _sendMessage(),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final ChatMessage message;

  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.sender == ChatSenderType.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isUser) ...[
            Container(
              width: 32,
              height: 32,
              margin: const EdgeInsets.only(right: 8, bottom: 4),
              decoration: const BoxDecoration(
                gradient: AppColors.aiCardGradient,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.auto_awesome, color: Colors.white, size: 16),
            ),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isUser
                    ? AppColors.primary
                    : (isDark ? AppColors.cardDark : Colors.white),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(18),
                  topRight: const Radius.circular(18),
                  bottomLeft: Radius.circular(isUser ? 18 : 4),
                  bottomRight: Radius.circular(isUser ? 4 : 18),
                ),
                border: !isUser
                    ? Border.all(
                        color: isDark ? AppColors.borderDark : AppColors.borderLight,
                      )
                    : null,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(isDark ? 30 : 10),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment:
                    isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  if (message.isVoice) ...[
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.mic_rounded,
                          size: 14,
                          color: isUser ? Colors.white70 : AppColors.coral,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          "Ovozli so'rov",
                          style: AppTypography.labelSmall.copyWith(
                            color: isUser ? Colors.white70 : AppColors.coral,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                  ],
                  Text(
                    message.text,
                    style: AppTypography.bodyMedium.copyWith(
                      color: isUser
                          ? Colors.white
                          : (isDark
                              ? AppColors.textPrimaryDark
                              : AppColors.deepDark),
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    DateFormatter.formatTime(message.timestamp),
                    style: AppTypography.bodySmall.copyWith(
                      color: isUser ? Colors.white70 : AppColors.textMutedLight,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isUser) const SizedBox(width: 8),
        ],
      ),
    );
  }
}
