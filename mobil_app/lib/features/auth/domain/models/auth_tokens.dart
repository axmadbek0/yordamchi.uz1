class AuthTokens {
  final String accessToken;
  final String? refreshToken;

  AuthTokens({
    required this.accessToken,
    this.refreshToken,
  });

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      accessToken: json['accessToken'] ?? json['token'] ?? '',
      refreshToken: json['refreshToken'],
    );
  }
}
