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
    }
}
