using Microsoft.EntityFrameworkCore;
using OticaERP.API.Models;

namespace OticaERP.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Client> Clients { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<ServiceOrder> ServiceOrders { get; set; }
        // Adicione esta linha se não existir, para as receitas
        public DbSet<Prescription> Prescriptions { get; set; } 

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configurações de precisão para valores monetários (Boas Práticas)
            modelBuilder.Entity<Sale>()
                .Property(s => s.TotalValue).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Sale>()
                .Property(s => s.EntryValue).HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Product>()
                .Property(p => p.Price).HasColumnType("decimal(18,2)");

            modelBuilder.Entity<ServiceOrder>()
                .Property(s => s.Price).HasColumnType("decimal(18,2)");

            // --- CORREÇÃO DA LIGAÇÃO (RELACIONAMENTO) ---
            // Dizemos explicitamente: Uma Ordem de Serviço TEM UMA Venda, usando a chave SaleId
            modelBuilder.Entity<ServiceOrder>()
                .HasOne(so => so.Sale)
                .WithMany() // A venda não precisa ter uma lista de OS, então usamos WithMany vazio ou WithOne
                .HasForeignKey(so => so.SaleId)
                .OnDelete(DeleteBehavior.Restrict); // Evita apagar em cascata acidentalmente
        }
    }
}