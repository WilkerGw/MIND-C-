using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OticaERP.API.Migrations
{
    /// <inheritdoc />
    public partial class RestoreEntryValue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "EntryValue",
                table: "Sales",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "Prescriptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ClientId = table.Column<int>(type: "INTEGER", nullable: false),
                    ExamDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    OdEsferico = table.Column<decimal>(type: "TEXT", nullable: false),
                    OdCilindrico = table.Column<decimal>(type: "TEXT", nullable: false),
                    OdEixo = table.Column<int>(type: "INTEGER", nullable: false),
                    OeEsferico = table.Column<decimal>(type: "TEXT", nullable: false),
                    OeCilindrico = table.Column<decimal>(type: "TEXT", nullable: false),
                    OeEixo = table.Column<int>(type: "INTEGER", nullable: false),
                    Dnp = table.Column<decimal>(type: "TEXT", nullable: false),
                    Adicao = table.Column<decimal>(type: "TEXT", nullable: false),
                    Altura = table.Column<decimal>(type: "TEXT", nullable: false),
                    Observation = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prescriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Prescriptions_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_ClientId",
                table: "Prescriptions",
                column: "ClientId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "EntryValue",
                table: "Sales");
        }
    }
}
