using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OticaERP.API.Migrations
{
    /// <inheritdoc />
    public partial class AddQuantityToSale : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "Sales",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "Sales");
        }
    }
}
