    package com.example.realchatapplication.jwt;

    import com.example.realchatapplication.model.User;
    import io.jsonwebtoken.Claims;
    import io.jsonwebtoken.Jwts;
    import io.jsonwebtoken.security.Keys;
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.stereotype.Service;

    import javax.crypto.SecretKey;
    import java.util.Date;
    import java.util.HashMap;
    import java.util.Map;
    import java.util.function.Function;

    @Service
    public class JwtService {

        @Value("${jwt.secret}")
        private String secretKey;

        @Value("${jwt.expiration}")
        private Long jwtexpiration;

        public String extractUserId(String jwtToken) {
            return extractClaim(jwtToken, claims -> claims.get("userId", String.class));
        }

        public String extractUsername(String jwtToken) {
            return extractClaim(jwtToken, Claims::getSubject);
        }

        private <T> T extractClaim(String jwtToken, Function<Claims, T> claimResolver) {
            final Claims claims = extractAllClaims(jwtToken);
            return claimResolver.apply(claims);
        }

        private Claims extractAllClaims(String jwtToken) {
            return Jwts.parser()
                    .verifyWith(getSignInKey())
                    .build()
                    .parseSignedClaims(jwtToken)
                    .getPayload();
        }

        public SecretKey getSignInKey() {
            return Keys.hmacShaKeyFor(secretKey.getBytes());
        }

        public String generateToken(User user) {
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId());
            return Jwts.builder()
                    .claims(claims)
                    .subject(user.getEmail())
                    .issuedAt(new Date(System.currentTimeMillis()))
                    .expiration(new Date(System.currentTimeMillis() + jwtexpiration))
                    .signWith(getSignInKey())
                    .compact();
        }

        public boolean isTokenValid(String jwtToken, User user) {
            if (jwtToken == null || user == null) return false;

            final String userIdFromToken = extractUserId(jwtToken);
            final String usernameFromToken = extractUsername(jwtToken);

            if (userIdFromToken == null || usernameFromToken == null) return false;

            return userIdFromToken.equals(user.getId()) &&
                    usernameFromToken.equals(user.getEmail()) &&
                    !isTokenExpired(jwtToken);
        }

        private boolean isTokenExpired(String jwtToken) {
            return extractExpiration(jwtToken).before(new Date());
        }

        private Date extractExpiration(String jwtToken) {
            return extractClaim(jwtToken, Claims::getExpiration);
        }
    }
