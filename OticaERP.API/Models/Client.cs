using System.ComponentModel.DataAnnotations;

namespace OticaERP.API.Models
{
    public class Client
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Phone]
        public string? Phone { get; set; }

        // REMOVIDO: public string? Email { get; set; } 
        // Como não vamos coletar email, removemos a propriedade para o EF Core não buscar a coluna.

        [StringLength(14)]
        public string Cpf { get; set; } = string.Empty;

        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Street { get; set; }
        public string? District { get; set; }
        public string? ZipCode { get; set; }
        public string? City { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}