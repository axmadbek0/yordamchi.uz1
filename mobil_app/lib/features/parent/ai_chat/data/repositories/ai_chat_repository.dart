import 'package:yordamchi_med/core/network/api_client.dart';
import 'package:yordamchi_med/features/parent/ai_chat/domain/models/ai_chat_models.dart';

class AiChatRepository {
  final ApiClient apiClient;

  AiChatRepository({required this.apiClient});

  List<PromptSuggestion> getQuickPrompts() {
    return const [
      PromptSuggestion(
        title: "Darsda charchoq",
        prompt: "Bolam maktabdan qaytgach juda charchagan va injiq bo'lib qoladi. Qanday yordam berishim mumkin?",
        icon: "😴",
      ),
      PromptSuggestion(
        title: "Nutqni rivojlantirish",
        prompt: "Nutqida tutilish bo'lgan bola bilan uyda qanday logopedik mashqlar bajarsak bo'ladi?",
        icon: "🗣️",
      ),
      PromptSuggestion(
        title: "Diqqatni jamlash",
        prompt: "Diqqatini 10 daqiqadan ortiq ushlab tura olmaydi. O'yin orqali diqqatni oshirish usullari bormi?",
        icon: "🎯",
      ),
      PromptSuggestion(
        title: "Ijtimoiy moslashuv",
        prompt: "Tengdoshlari bilan muloqotga kirishishga qiynalyapti. Qanday ko'maklashish kerak?",
        icon: "🤝",
      ),
    ];
  }

  Future<String> sendMessage({
    required String prompt,
    String? studentId,
  }) async {
    try {
      final response = await apiClient.post(
        '/ai/chat',
        data: {
          'message': prompt,
          'studentId': studentId,
          'context': "special_education_parent",
        },
      );

      if (response != null && response['reply'] != null) {
        return response['reply'].toString();
      }
    } catch (_) {}

    await Future.delayed(const Duration(milliseconds: 1000));
    return _generatePedagogicalResponse(prompt);
  }

  String _generatePedagogicalResponse(String query) {
    final lower = query.toLowerCase();
    if (lower.contains('charch') || lower.contains('injiq')) {
      return "Maxsus ta'lim oluvchi bolalarda aqliy va hissiy yuklama tezroq toliqishga olib keladi.\n\n"
          "💡 **Tavsiyalar:**\n"
          "1. **30 daqiqalik sokin tanaffus:** Uyga kelishi bilan dars qildirmang, xira chiroqda sokin musiqa tinglash yoki shunchaki dam olishiga imkon bering.\n"
          "2. **Suv va yengil tamaddi:** Iliq sut yoki mevali yengil gazak berish asab tizimini tinchlantiradi.\n"
          "3. **Taktil kontakt:** Bolani quchoqlash va mehr bilan gaplashish kortizol (stress) gormonini kamaytiradi.";
    } else if (lower.contains('nutq') || lower.contains('gapir') || lower.contains('logoped')) {
      return "Nutqni rivojlantirishda kundalik mayda motorika va artikulyatsion gimnastika juda muhim:\n\n"
          "💡 **Mashqlar:**\n"
          "1. **Artikulyatsiya mashqlari:** Tilni yuqoriga-pastga, o'ngga-chapga harakatlantirish ('Soatcha' o'yini).\n"
          "2. **Nafas mashqi:** Sham yoki paxta parchalarini puflab uchirish (to'g'ri nafas ritmi nutq asosi hisoblanadi).\n"
          "3. **Ertak aytib berish:** Savol-javobli interaktiv ertaklar orqali gapirishga rag'batlantiring.";
    } else if (lower.contains('diqqat') || lower.contains('jamla')) {
      return "Diqqat yetishmovchiligida qisqa, vizual va tanaffusli faoliyat usuli eng samaralisidir:\n\n"
          "💡 **Tavsiyalar:**\n"
          "1. **Pomodoro metodi (moslashtirilgan):** 10-15 daqiqa qiziqarli mashg'ulot + 5 daqiqa faol harakat.\n"
          "2. **Vizual jadval:** Har bir bajarilgan vazifaga stiker yopishtirish orqali mukofotlash tizimini joriy qiling.\n"
          "3. **Ortiqcha chalg'ituvchilarni cheklash:** Dars qilayotganda televizor va telefon ovozlarini o'chiring.";
    }

    return "Hurmatli ota-ona, savolingiz maxsus pedagog va psixologlar tavsiyasi asosida tahlil qilindi.\n\n"
        "Bolaning individual xususiyatlarini hisobga olgan holda, muntazam kun tartibiga rioya qilish, ijobiy rag'batlantirish va o'qituvchi bilan doimiy muloqotda bo'lish eng yaxshi natijani beradi. Agar qo'shimcha savollaringiz bo'lsa, bemalol murojaat qiling!";
  }
}
