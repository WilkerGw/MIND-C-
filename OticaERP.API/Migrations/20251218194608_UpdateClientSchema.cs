using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OticaERP.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateClientSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Clients",
                newName: "FullName");

            migrationBuilder.RenameColumn(
                name: "Address",
                table: "Clients",
                newName: "ZipCode");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "District",
                table: "Clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "Clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Street",
                table: "Clients",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "District",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Street",
                table: "Clients");

            migrationBuilder.RenameColumn(
                name: "ZipCode",
                table: "Clients",
                newName: "Address");

            migrationBuilder.RenameColumn(
                name: "FullName",
                table: "Clients",
                newName: "Name");
        }
    }
}
