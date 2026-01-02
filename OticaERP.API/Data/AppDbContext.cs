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
        public DbSet<SaleItem> SaleItems { get; set; } // NOVO
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<ServiceOrder> ServiceOrders { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configurações de precisão
            modelBuilder.Entity<Sale>().Property(s => s.TotalValue).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Sale>().Property(s => s.EntryValue).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Product>().Property(p => p.SellingPrice).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Product>().Property(p => p.CostPrice).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<ServiceOrder>().Property(s => s.Price).HasColumnType("decimal(18,2)");
            
            // Configuração do Item de Venda
            modelBuilder.Entity<SaleItem>().Property(si => si.UnitPrice).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<SaleItem>().Property(si => si.SubTotal).HasColumnType("decimal(18,2)");

            // Relacionamento OS -> Venda
            // Relacionamento 1:1 entre Venda e OS
            // A OS possui a FK (SaleId)
            modelBuilder.Entity<Sale>()
                .HasOne(s => s.ServiceOrder)
                .WithOne(so => so.Sale)
                .HasForeignKey<ServiceOrder>(so => so.SaleId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}