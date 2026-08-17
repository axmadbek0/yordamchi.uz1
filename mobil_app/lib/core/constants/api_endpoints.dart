class ApiEndpoints {
  // Base URLs (configurable via environment or default to local/staging)
  static const String baseUrl = 'http://127.0.0.1:5000/api/v1';
  static const String webBaseUrl = 'http://localhost:5000/api/v1';

  // Auth
  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';

  // Students & Reports
  static const String myChildren = '/students/me/children';
  static const String students = '/students';
  static const String studentDetails = '/students'; // + /:id
  static const String dailyLogs = '/students/daily-logs';

  // AI & Chat
  static const String aiAnalyze = '/ai/analyze-status';
  static const String aiChat = '/ai/chat';
  static const String chats = '/chats';

  // Timeout settings
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);
}
