using System.Data;

namespace Library_Management.Data;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}