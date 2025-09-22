using BCrypt.Net;

class Program
{
    static void Main()
    {
        string senha = "admin123";
        string hashExistente = "$2a$11$bKzIWh.tWiO..XkUWgLr3.5LC72b9ubTs2upiJARUCJkq/E9o9Uku";
        
        Console.WriteLine($"Senha: {senha}");
        Console.WriteLine($"Hash existente: {hashExistente}");
        
        // Testar verificação com hash existente
        bool verificacaoExistente = BCrypt.Net.BCrypt.Verify(senha, hashExistente);
        Console.WriteLine($"Verificação com hash existente: {verificacaoExistente}");
        
        // Criar novo hash
        string novoHash = BCrypt.Net.BCrypt.HashPassword(senha);
        Console.WriteLine($"Novo hash: {novoHash}");
        
        // Testar verificação com novo hash
        bool verificacaoNova = BCrypt.Net.BCrypt.Verify(senha, novoHash);
        Console.WriteLine($"Verificação com novo hash: {verificacaoNova}");
        
        // Testar diferentes versões de BCrypt
        Console.WriteLine("\n--- Testando diferentes configurações ---");
        
        // Versão com workFactor 10
        string hash10 = BCrypt.Net.BCrypt.HashPassword(senha, 10);
        bool verif10 = BCrypt.Net.BCrypt.Verify(senha, hash10);
        Console.WriteLine($"Hash workFactor 10: {hash10}");
        Console.WriteLine($"Verificação workFactor 10: {verif10}");
        
        // Versão com workFactor 11 (mesmo do hash existente)
        string hash11 = BCrypt.Net.BCrypt.HashPassword(senha, 11);
        bool verif11 = BCrypt.Net.BCrypt.Verify(senha, hash11);
        Console.WriteLine($"Hash workFactor 11: {hash11}");
        Console.WriteLine($"Verificação workFactor 11: {verif11}");
    }
}