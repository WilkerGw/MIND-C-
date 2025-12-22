using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OticaERP.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FullName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "TEXT", nullable: true),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    Cpf = table.Column<string>(type: "TEXT", maxLength: 14, nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Gender = table.Column<string>(type: "TEXT", nullable: true),
                    Street = table.Column<string>(type: "TEXT", nullable: true),
                    District = table.Column<string>(type: "TEXT", nullable: true),
                    ZipCode = table.Column<string>(type: "TEXT", nullable: true),
                    City = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    ProductCode = table.Column<string>(type: "TEXT", nullable: false),
                    Price = table.Column<decimal>(type: "TEXT", nullable: false),
                    StockQuantity = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Username = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ClientId = table.Column<int>(type: "INTEGER", nullable: false),
                    AppointmentDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Appointments_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Sales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ClientId = table.Column<int>(type: "INTEGER", nullable: false),
                    SaleDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TotalValue = table.Column<decimal>(type: "TEXT", nullable: false),
                    ProductId = table.Column<int>(type: "INTEGER", nullable: false),
                    ServiceOrderId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sales_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Sales_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ClientId = table.Column<int>(type: "INTEGER", nullable: false),
                    ProductId = table.Column<int>(type: "INTEGER", nullable: false),
                    ServiceType = table.Column<int>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Price = table.Column<decimal>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DeliveryDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    SaleId = table.Column<int>(type: "INTEGER", nullable: true),
                    SaleId1 = table.Column<int>(type: "INTEGER", nullable: true),
                    ExamResult = table.Column<string>(type: "TEXT", nullable: true),
                    AppointmentId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceOrders_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ServiceOrders_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceOrders_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceOrders_Sales_SaleId1",
                        column: x => x.SaleId1,
                        principalTable: "Sales",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_ClientId",
                table: "Appointments",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Sales_ClientId",
                table: "Sales",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Sales_ProductId",
                table: "Sales",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_AppointmentId",
                table: "ServiceOrders",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_ClientId",
                table: "ServiceOrders",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_ProductId",
                table: "ServiceOrders",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_SaleId1",
                table: "ServiceOrders",
                column: "SaleId1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceOrders");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "Sales");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropTable(
                name: "Products");
        }
    }
}
